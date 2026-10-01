import { isDefined } from 'twenty-shared/utils';

import {
  buildOnboardingConstructionSiteScene,
  ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE,
  type OnboardingConstructionSiteLayout,
} from '@/onboarding/components/OnboardingConstructionSite/buildOnboardingConstructionSiteScene';
import { createOnboardingConstructionSiteTimeline } from '@/onboarding/components/OnboardingConstructionSite/createOnboardingConstructionSiteTimeline';
import {
  type OnboardingConstructionSiteInstanceBatch,
  type OnboardingConstructionSiteInstances,
  type OnboardingConstructionSiteMeshName,
} from '@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSiteInstances';
import {
  createLookAtMatrix,
  createPerspectiveMatrix,
  multiplyMatrices,
} from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteMatrices';
import { ONBOARDING_CONSTRUCTION_SITE_MESHES } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteMeshes';
import { type OnboardingConstructionSiteSettings } from '@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSiteSettings';
import { ONBOARDING_CONSTRUCTION_SITE_SHADERS } from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteShaders';
import { type OnboardingConstructionSiteStage } from '@/onboarding/components/OnboardingConstructionSite/OnboardingConstructionSiteStage';

const MESH_NAMES: readonly OnboardingConstructionSiteMeshName[] = [
  'cube',
  'cylinder',
  'cone',
  'mixerDrum',
];
const INSTANCE_CAPACITY: Record<OnboardingConstructionSiteMeshName, number> = {
  cube: 1024,
  cylinder: 256,
  cone: 16,
  mixerDrum: 4,
};

const MAXIMUM_DEVICE_PIXEL_RATIO = 2;
const MAXIMUM_CANVAS_PIXELS = 9_000_000;
const VIRTUAL_RENDER_HEIGHT_CSS_PIXELS = 768;
const FIELD_OF_VIEW_RADIANS = (32 * Math.PI) / 180;
const CAMERA_DISTANCE = 12;
const CONTENT_GAP_CSS_PIXELS = 44;
const CONTENT_FEATHER_CSS_PIXELS = 70;
const FILL_LIGHT_DIRECTION = [-0.9045, -0.3015, 0.3015] as const;
const FINALE_WAVE_AMOUNT = 0.35;
const FINALE_SCATTER_AMOUNT = 0.06;
const SOFTWARE_RENDERER_PATTERN =
  /swiftshader|llvmpipe|software|basic render driver/i;

const compileProgram = (
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
) => {
  const compileShader = (shaderType: number, source: string) => {
    const shader = gl.createShader(shaderType);
    if (!isDefined(shader)) {
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (
    !isDefined(vertexShader) ||
    !isDefined(fragmentShader) ||
    !isDefined(program)
  ) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
};

type MeshResources = {
  vertexArray: WebGLVertexArrayObject;
  vertexBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
  vertexCount: number;
};

type UniformLookup = (name: string) => WebGLUniformLocation | null;

type GlResources = {
  sceneProgram: WebGLProgram;
  halftoneProgram: WebGLProgram;
  sceneUniform: UniformLookup;
  halftoneUniform: UniformLookup;
  meshes: Record<OnboardingConstructionSiteMeshName, MeshResources>;
  sceneTexture: WebGLTexture;
  sceneDepthBuffer: WebGLRenderbuffer;
  sceneFramebuffer: WebGLFramebuffer;
  emptyVertexArray: WebGLVertexArrayObject;
};

const deleteResources = (
  gl: WebGL2RenderingContext,
  resources: GlResources,
) => {
  gl.deleteProgram(resources.sceneProgram);
  gl.deleteProgram(resources.halftoneProgram);
  Object.values(resources.meshes).forEach(
    ({ vertexArray, vertexBuffer, instanceBuffer }) => {
      gl.deleteVertexArray(vertexArray);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(instanceBuffer);
    },
  );
  gl.deleteTexture(resources.sceneTexture);
  gl.deleteRenderbuffer(resources.sceneDepthBuffer);
  gl.deleteFramebuffer(resources.sceneFramebuffer);
  gl.deleteVertexArray(resources.emptyVertexArray);
};

type OnboardingConstructionSiteColor = readonly [number, number, number];

export type OnboardingConstructionSiteColors = {
  dashColor: OnboardingConstructionSiteColor;
};

type CreateOnboardingConstructionSiteRendererOptions = {
  canvas: HTMLCanvasElement;
  colors: OnboardingConstructionSiteColors;
  settings: OnboardingConstructionSiteSettings;
  contentColumnWidth: number;
  prefersReducedMotion: boolean;
};

export type OnboardingConstructionSiteRenderer = {
  setStage: (stage: OnboardingConstructionSiteStage) => void;
  setColors: (colors: OnboardingConstructionSiteColors) => void;
  resize: () => void;
  destroy: () => void;
};

export const createOnboardingConstructionSiteRenderer = ({
  canvas,
  colors: initialColors,
  settings,
  contentColumnWidth,
  prefersReducedMotion,
}: CreateOnboardingConstructionSiteRendererOptions): OnboardingConstructionSiteRenderer | null => {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  });
  if (!isDefined(gl)) {
    return null;
  }

  const debugRendererInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const shouldReduceMotion =
    prefersReducedMotion ||
    (isDefined(debugRendererInfo) &&
      SOFTWARE_RENDERER_PATTERN.test(
        gl.getParameter(debugRendererInfo.UNMASKED_RENDERER_WEBGL),
      ));

  const createInstanceBatch = (
    meshName: OnboardingConstructionSiteMeshName,
  ): OnboardingConstructionSiteInstanceBatch => ({
    data: new Float32Array(
      INSTANCE_CAPACITY[meshName] *
        ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE,
    ),
    count: 0,
  });

  const instances: OnboardingConstructionSiteInstances = {
    cube: createInstanceBatch('cube'),
    cylinder: createInstanceBatch('cylinder'),
    cone: createInstanceBatch('cone'),
    mixerDrum: createInstanceBatch('mixerDrum'),
  };

  let resources: GlResources | null = null;
  let colors = initialColors;
  let cssWidth = 0;
  let cssHeight = 0;
  let devicePixelRatio = 1;
  let sceneWidth = 1;
  let sceneHeight = 1;
  const timeline = createOnboardingConstructionSiteTimeline();
  const truckTimeline = createOnboardingConstructionSiteTimeline({
    transitionSecondsPerStep: 2.2,
    easing: (ratio) => ratio,
  });
  let hasStage = false;
  let animationFrameHandle: number | null = null;
  let elapsedSeconds = 0;
  let lastFrameTimeMs: number | null = null;
  let isDestroyed = false;

  const createResources = (): GlResources | null => {
    const sceneProgram = compileProgram(
      gl,
      ONBOARDING_CONSTRUCTION_SITE_SHADERS.sceneVertex,
      ONBOARDING_CONSTRUCTION_SITE_SHADERS.sceneFragment,
    );
    const halftoneProgram = compileProgram(
      gl,
      ONBOARDING_CONSTRUCTION_SITE_SHADERS.fullScreenVertex,
      ONBOARDING_CONSTRUCTION_SITE_SHADERS.halftoneFragment,
    );
    const sceneTexture = gl.createTexture();
    const sceneDepthBuffer = gl.createRenderbuffer();
    const sceneFramebuffer = gl.createFramebuffer();
    const emptyVertexArray = gl.createVertexArray();
    if (
      !isDefined(sceneProgram) ||
      !isDefined(halftoneProgram) ||
      !isDefined(sceneTexture) ||
      !isDefined(sceneDepthBuffer) ||
      !isDefined(sceneFramebuffer) ||
      !isDefined(emptyVertexArray)
    ) {
      return null;
    }

    const positionLocation = gl.getAttribLocation(sceneProgram, 'position');
    const normalLocation = gl.getAttribLocation(sceneProgram, 'normal');
    const columnLocations = [0, 1, 2, 3].map((columnIndex) =>
      gl.getAttribLocation(sceneProgram, `instanceColumn${columnIndex}`),
    );
    const albedoLocation = gl.getAttribLocation(sceneProgram, 'instanceAlbedo');
    const instanceStride = ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE * 4;

    const createMeshResources = (
      meshName: OnboardingConstructionSiteMeshName,
    ): MeshResources | null => {
      const vertexData = ONBOARDING_CONSTRUCTION_SITE_MESHES[meshName];
      const vertexArray = gl.createVertexArray();
      const vertexBuffer = gl.createBuffer();
      const instanceBuffer = gl.createBuffer();
      if (
        !isDefined(vertexArray) ||
        !isDefined(vertexBuffer) ||
        !isDefined(instanceBuffer)
      ) {
        return null;
      }

      gl.bindVertexArray(vertexArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(normalLocation);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 24, 12);

      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        instances[meshName].data.byteLength,
        gl.DYNAMIC_DRAW,
      );
      columnLocations.forEach((columnLocation, columnIndex) => {
        gl.enableVertexAttribArray(columnLocation);
        gl.vertexAttribPointer(
          columnLocation,
          4,
          gl.FLOAT,
          false,
          instanceStride,
          columnIndex * 16,
        );
        gl.vertexAttribDivisor(columnLocation, 1);
      });
      gl.enableVertexAttribArray(albedoLocation);
      gl.vertexAttribPointer(
        albedoLocation,
        1,
        gl.FLOAT,
        false,
        instanceStride,
        64,
      );
      gl.vertexAttribDivisor(albedoLocation, 1);

      return {
        vertexArray,
        vertexBuffer,
        instanceBuffer,
        vertexCount: vertexData.length / 6,
      };
    };

    const cubeMesh = createMeshResources('cube');
    const cylinderMesh = createMeshResources('cylinder');
    const coneMesh = createMeshResources('cone');
    const mixerDrumMesh = createMeshResources('mixerDrum');
    gl.bindVertexArray(null);

    if (
      !isDefined(cubeMesh) ||
      !isDefined(cylinderMesh) ||
      !isDefined(coneMesh) ||
      !isDefined(mixerDrumMesh)
    ) {
      return null;
    }

    const createUniformLookup = (program: WebGLProgram): UniformLookup => {
      const locations = new Map<string, WebGLUniformLocation | null>();
      return (name) => {
        if (!locations.has(name)) {
          locations.set(name, gl.getUniformLocation(program, name));
        }
        return locations.get(name) ?? null;
      };
    };

    return {
      sceneProgram,
      halftoneProgram,
      sceneUniform: createUniformLookup(sceneProgram),
      halftoneUniform: createUniformLookup(halftoneProgram),
      meshes: {
        cube: cubeMesh,
        cylinder: cylinderMesh,
        cone: coneMesh,
        mixerDrum: mixerDrumMesh,
      },
      sceneTexture,
      sceneDepthBuffer,
      sceneFramebuffer,
      emptyVertexArray,
    };
  };

  const allocateSceneTarget = () => {
    if (!isDefined(resources)) {
      return;
    }

    gl.bindTexture(gl.TEXTURE_2D, resources.sceneTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA8,
      sceneWidth,
      sceneHeight,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindRenderbuffer(gl.RENDERBUFFER, resources.sceneDepthBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT24,
      sceneWidth,
      sceneHeight,
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.sceneFramebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      resources.sceneTexture,
      0,
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      resources.sceneDepthBuffer,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const getLayout = (): OnboardingConstructionSiteLayout => {
    const halfHeight = Math.tan(FIELD_OF_VIEW_RADIANS / 2) * CAMERA_DISTANCE;
    const halfWidth = halfHeight * (cssWidth / Math.max(cssHeight, 1));
    return {
      halfWidth,
      halfHeight,
      contentHalfWidth:
        ((contentColumnWidth / 2 + CONTENT_GAP_CSS_PIXELS) /
          Math.max(cssWidth, 1)) *
        2 *
        halfWidth,
      groundY: -halfHeight,
    };
  };

  const renderFrame = () => {
    if (!isDefined(resources) || cssWidth < 1 || cssHeight < 1 || !hasStage) {
      return;
    }

    const finaleBump = timeline.getFinaleBump();

    const layout = getLayout();
    buildOnboardingConstructionSiteScene({
      instances,
      layout,
      construction: timeline.getConstruction(),
      truckConstruction: truckTimeline.getConstruction(),
      craneMotion: timeline.getMotion(),
    });

    const eye = [0, layout.groundY, CAMERA_DISTANCE] as const;
    const viewProjection = multiplyMatrices(
      createPerspectiveMatrix(
        FIELD_OF_VIEW_RADIANS,
        cssWidth / cssHeight,
        0.1,
        60,
        layout.groundY / layout.halfHeight,
      ),
      createLookAtMatrix(eye, [0, layout.groundY, 0]),
    );

    const lightAngle = (settings.keyLightAngleDegrees * Math.PI) / 180;
    const lightHeight = settings.keyLightHeight;
    const lightX = Math.cos(lightAngle) * 5;
    const lightZ = Math.sin(lightAngle) * 5;
    const lightLength = Math.hypot(lightX, lightHeight, lightZ);

    gl.bindFramebuffer(gl.FRAMEBUFFER, resources.sceneFramebuffer);
    gl.viewport(0, 0, sceneWidth, sceneHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const { sceneUniform, halftoneUniform } = resources;
    gl.useProgram(resources.sceneProgram);
    gl.uniformMatrix4fv(sceneUniform('viewProjection'), false, viewProjection);
    gl.uniform3f(
      sceneUniform('keyLightDirection'),
      lightX / lightLength,
      lightHeight / lightLength,
      lightZ / lightLength,
    );
    gl.uniform1f(sceneUniform('keyLightIntensity'), settings.keyLightIntensity);
    gl.uniform3f(
      sceneUniform('fillLightDirection'),
      FILL_LIGHT_DIRECTION[0],
      FILL_LIGHT_DIRECTION[1],
      FILL_LIGHT_DIRECTION[2],
    );
    gl.uniform1f(
      sceneUniform('fillLightIntensity'),
      settings.fillLightIntensity,
    );
    gl.uniform1f(sceneUniform('ambientIntensity'), settings.ambientIntensity);
    gl.uniform1f(
      sceneUniform('environmentIntensity'),
      settings.environmentIntensity,
    );
    gl.uniform1f(sceneUniform('roughness'), settings.materialRoughness);
    gl.uniform1f(sceneUniform('metalness'), settings.materialMetalness);
    gl.uniform3f(sceneUniform('cameraPosition'), eye[0], eye[1], eye[2]);

    for (const meshName of MESH_NAMES) {
      const batch = instances[meshName];
      if (batch.count === 0) {
        continue;
      }
      const mesh = resources.meshes[meshName];
      gl.bindVertexArray(mesh.vertexArray);
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.instanceBuffer);
      gl.bufferSubData(
        gl.ARRAY_BUFFER,
        0,
        batch.data,
        0,
        batch.count * ONBOARDING_CONSTRUCTION_SITE_FLOATS_PER_INSTANCE,
      );
      gl.drawArraysInstanced(gl.TRIANGLES, 0, mesh.vertexCount, batch.count);
    }
    gl.bindVertexArray(null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, resources.sceneTexture);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.useProgram(resources.halftoneProgram);
    const tileSize =
      settings.dashPitch *
      Math.min(1, cssHeight / VIRTUAL_RENDER_HEIGHT_CSS_PIXELS) *
      devicePixelRatio;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, resources.sceneTexture);
    gl.uniform1i(halftoneUniform('sceneTexture'), 0);
    gl.uniform1f(
      halftoneUniform('sceneLod'),
      Math.log2(
        Math.max(
          (tileSize / devicePixelRatio / 2) * (sceneWidth / cssWidth),
          1,
        ),
      ),
    );
    gl.uniform2f(halftoneUniform('canvasSize'), canvas.width, canvas.height);
    gl.uniform1f(halftoneUniform('tileSize'), tileSize);
    gl.uniform1f(halftoneUniform('power'), settings.halftonePower);
    gl.uniform1f(halftoneUniform('width'), settings.dashWidth);
    gl.uniform1f(halftoneUniform('dashScale'), settings.dashScale);
    gl.uniform1f(halftoneUniform('dashThreshold'), settings.dashThreshold);
    gl.uniform1f(halftoneUniform('dashOpacity'), settings.dashOpacity);
    gl.uniform3f(
      halftoneUniform('dashColor'),
      colors.dashColor[0],
      colors.dashColor[1],
      colors.dashColor[2],
    );
    gl.uniform1f(halftoneUniform('time'), elapsedSeconds);
    gl.uniform1f(
      halftoneUniform('waveAmount'),
      shouldReduceMotion ? 0 : FINALE_WAVE_AMOUNT * finaleBump,
    );
    gl.uniform1f(halftoneUniform('waveSpeed'), 1);
    gl.uniform1f(
      halftoneUniform('scatterAmount'),
      FINALE_SCATTER_AMOUNT * finaleBump,
    );
    gl.uniform3f(
      halftoneUniform('contentColumn'),
      canvas.width / 2,
      (contentColumnWidth / 2 + CONTENT_GAP_CSS_PIXELS / 2) * devicePixelRatio,
      CONTENT_FEATHER_CSS_PIXELS * devicePixelRatio,
    );
    gl.uniform1f(
      halftoneUniform('contentColumnOpacity'),
      settings.contentColumnOpacity,
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(resources.emptyVertexArray);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  };

  const tick = (nowMs: number) => {
    animationFrameHandle = null;
    if (isDestroyed || cssWidth < 1 || cssHeight < 1) {
      return;
    }

    const deltaSeconds = isDefined(lastFrameTimeMs)
      ? Math.min((nowMs - lastFrameTimeMs) / 1000, 0.1)
      : 0;
    elapsedSeconds += deltaSeconds;
    timeline.advance(deltaSeconds);
    truckTimeline.advance(deltaSeconds);
    renderFrame();

    if (timeline.isTransitioning() || truckTimeline.isTransitioning()) {
      lastFrameTimeMs = nowMs;
      animationFrameHandle = requestAnimationFrame(tick);
    } else {
      lastFrameTimeMs = null;
    }
  };

  const requestRender = () => {
    if (shouldReduceMotion) {
      renderFrame();
      return;
    }
    if (!isDefined(animationFrameHandle)) {
      animationFrameHandle = requestAnimationFrame(tick);
    }
  };

  const resize = () => {
    cssWidth = canvas.clientWidth;
    cssHeight = canvas.clientHeight;
    devicePixelRatio = Math.min(
      Math.max(1, window.devicePixelRatio || 1),
      MAXIMUM_DEVICE_PIXEL_RATIO,
      Math.sqrt(MAXIMUM_CANVAS_PIXELS / Math.max(cssWidth * cssHeight, 1)),
    );
    const sceneScale = Math.min(1, devicePixelRatio);
    canvas.width = Math.max(1, Math.round(cssWidth * devicePixelRatio));
    canvas.height = Math.max(1, Math.round(cssHeight * devicePixelRatio));
    sceneWidth = Math.max(1, Math.round(cssWidth * sceneScale));
    sceneHeight = Math.max(1, Math.round(cssHeight * sceneScale));
    allocateSceneTarget();
    renderFrame();
  };

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    resources = null;
  };

  const handleContextRestored = () => {
    resources = createResources();
    allocateSceneTarget();
    requestRender();
  };

  resources = createResources();
  if (!isDefined(resources)) {
    return null;
  }

  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);
  resize();

  return {
    setStage: ({ stageIndex }) => {
      if (shouldReduceMotion) {
        timeline.jumpToStageIndex(stageIndex);
        truckTimeline.jumpToStageIndex(stageIndex);
      } else {
        timeline.setTargetStageIndex(stageIndex);
        if (hasStage) {
          truckTimeline.setTargetStageIndex(stageIndex);
        } else {
          truckTimeline.jumpToStageIndex(stageIndex);
        }
      }
      hasStage = true;
      requestRender();
    },
    setColors: (nextColors) => {
      colors = nextColors;
      requestRender();
    },
    resize,
    destroy: () => {
      isDestroyed = true;
      if (isDefined(animationFrameHandle)) {
        cancelAnimationFrame(animationFrameHandle);
      }
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (isDefined(resources)) {
        deleteResources(gl, resources);
        resources = null;
      }
    },
  };
};
