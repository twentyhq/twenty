// Based on the supplied Halftone Studio export. The grid stays
// in CSS pixels so resizing the window never magnifies the dashes.
const EFFECT_SCALE = 1.04;
const TILE_SIZE = 10.91 * (4 / 6) * EFFECT_SCALE;
const POWER = -0.07;
const POWER_AMPLITUDE = 0.28;
const ANIMATION_PERIOD_MS = 8_000;
const FRAME_INTERVAL_MS = 1_000 / 24;

const VERTEX_SHADER = `#version 300 es
  in vec2 position;
  out vec2 imagePosition;
  void main() {
    imagePosition = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `#version 300 es
  precision highp float;
  uniform sampler2D sourceImage;
  uniform vec2 viewportSize;
  uniform float imageAspect;
  uniform float effectScale;
  uniform float tileSize;
  uniform float power;
  uniform float time;
  uniform float inkOpacity;
  uniform float accentOpacity;
  uniform vec3 accentRegion;
  uniform float edgeFade;
  in vec2 imagePosition;
  out vec4 fragmentColor;

  vec2 coverImage(vec2 position) {
    float viewportAspect = viewportSize.x / viewportSize.y;
    if (imageAspect > viewportAspect) {
      position.x = (position.x - 0.5) * viewportAspect / imageAspect + 0.5;
    } else {
      position.y = (position.y - 0.5) * imageAspect / viewportAspect + 0.5;
    }
    return (position - 0.5) / effectScale + 0.5;
  }

  vec3 linearColor(vec3 color) {
    return mix(pow((color + 0.055) / 1.055, vec3(2.4)),
      color / 12.92, lessThanEqual(color, vec3(0.04045)));
  }

  void main() {
    vec2 gridPosition = imagePosition * viewportSize / tileSize;
    vec2 samplePosition = (floor(gridPosition) + 0.5) * tileSize / viewportSize;
    vec2 sampleUv = coverImage(samplePosition);
    vec4 sampleColor = texture(sourceImage, clamp(sampleUv, 0.0, 1.0));
    float tone = dot(linearColor(sampleColor.rgb), vec3(1.0 / 3.0));
    float wave = sin(samplePosition.x * 5.0 + samplePosition.y * 3.0 - time * 0.65);
    float radius = clamp(tone + (power + wave * 0.16) * length(vec2(0.5)) / 3.0, 0.0, 1.0) * 0.93;
    vec2 cellPosition = fract(gridPosition) - 0.5;
    float distanceToSegment = length(vec2(
      max(abs(cellPosition.x) - radius, 0.0), cellPosition.y));
    float signedDistance = distanceToSegment - 0.46 * radius;
    float edge = max(0.02, fwidth(signedDistance));
    float alpha = (1.0 - smoothstep(0.0, edge, signedDistance))
      * step(0.0001, radius) * sampleColor.a;
    float ink = (60.0 + 12.0 * wave) / 255.0;
    float blueWeight = 1.0 - smoothstep(0.15, 1.0,
      length((imagePosition - vec2(0.5, accentRegion.x)) / accentRegion.yz));
    blueWeight *= step(0.0001, accentOpacity);
    float edgeVisibility = mix(1.0,
      (1.0 - smoothstep(0.2, 0.5, abs(imagePosition.x - 0.5)))
      * smoothstep(0.0, 0.55, imagePosition.y), edgeFade);
    vec3 brandBlue = vec3(25.0, 97.0, 237.0) / 255.0;
    float opacity = mix(inkOpacity, accentOpacity, blueWeight);
    vec3 inkColor = mix(vec3(ink) * inkOpacity, brandBlue * accentOpacity, blueWeight);

    // One sparse mote per cell avoids a particle loop at every screen pixel.
    vec2 pixelPosition = imagePosition * viewportSize;
    vec2 particleCell = floor(pixelPosition / 180.0);
    float seed = fract(sin(dot(particleCell, vec2(127.1, 311.7))) * 43758.5453);
    float phase = fract(time / 18.0 + seed);
    vec2 particlePosition = vec2(
      45.0 + seed * 90.0 + sin(time * 0.35 + seed * 6.28) * 12.0,
      25.0 + phase * 130.0);
    float particleDistance = length(mod(pixelPosition, 180.0) - particlePosition);
    float particle = (1.0 - smoothstep(0.7, 2.0, particleDistance))
      * pow(sin(phase * 3.14159), 2.0) * 0.45 * inkOpacity;
    vec3 particleColor = mix(vec3(0.52), vec3(0.38, 0.62, 0.95), blueWeight);
    fragmentColor = vec4(particleColor * particle + inkColor * alpha * (1.0 - particle),
      particle + alpha * opacity * (1.0 - particle)) * edgeVisibility;
  }
`;

const compileShader = (
  context: WebGL2RenderingContext,
  shaderType: number,
  source: string,
) => {
  const shader = context.createShader(shaderType);
  if (!shader) throw new Error('Could not create the halftone shader.');
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    const message = context.getShaderInfoLog(shader);
    context.deleteShader(shader);
    throw new Error(message ?? 'Could not compile the halftone shader.');
  }
  return shader;
};

export const createHalftone = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
) => {
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  });
  if (!context) return;

  const program = context.createProgram();
  const buffer = context.createBuffer();
  const texture = context.createTexture();
  const shaders: WebGLShader[] = [];
  const disposeResources = () => {
    shaders.forEach((shader) => context.deleteShader(shader));
    context.deleteTexture(texture);
    context.deleteBuffer(buffer);
    context.deleteProgram(program);
  };

  try {
    if (!program || !buffer || !texture)
      throw new Error('Could not allocate the halftone renderer.');
    shaders.push(compileShader(context, context.VERTEX_SHADER, VERTEX_SHADER));
    shaders.push(
      compileShader(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER),
    );
    shaders.forEach((shader) => context.attachShader(program, shader));
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS))
      throw new Error(
        context.getProgramInfoLog(program) ??
          'Could not link the halftone shader.',
      );
    context.useProgram(program);
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      context.STATIC_DRAW,
    );
    const position = context.getAttribLocation(program, 'position');
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);
    context.bindTexture(context.TEXTURE_2D, texture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MIN_FILTER,
      context.LINEAR,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_MAG_FILTER,
      context.LINEAR,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_S,
      context.CLAMP_TO_EDGE,
    );
    context.texParameteri(
      context.TEXTURE_2D,
      context.TEXTURE_WRAP_T,
      context.CLAMP_TO_EDGE,
    );
    context.texImage2D(
      context.TEXTURE_2D,
      0,
      context.RGBA,
      context.RGBA,
      context.UNSIGNED_BYTE,
      image,
    );
    context.uniform1i(context.getUniformLocation(program, 'sourceImage'), 0);
    context.uniform1f(
      context.getUniformLocation(program, 'imageAspect'),
      image.naturalWidth / image.naturalHeight,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'tileSize'),
      TILE_SIZE,
    );
    context.uniform1f(
      context.getUniformLocation(program, 'effectScale'),
      EFFECT_SCALE,
    );
  } catch (error) {
    disposeResources();
    throw error;
  }

  const viewportUniform = context.getUniformLocation(program, 'viewportSize');
  const powerUniform = context.getUniformLocation(program, 'power');
  const timeUniform = context.getUniformLocation(program, 'time');
  const inkOpacityUniform = context.getUniformLocation(program, 'inkOpacity');
  const accentOpacityUniform = context.getUniformLocation(
    program,
    'accentOpacity',
  );
  const accentRegionUniform = context.getUniformLocation(
    program,
    'accentRegion',
  );
  const edgeFadeUniform = context.getUniformLocation(program, 'edgeFade');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let animationFrame = 0;
  let previousFrame = 0;
  let elapsed = 0;

  const draw = () => {
    const style = getComputedStyle(canvas);
    context.uniform1f(
      inkOpacityUniform,
      Number(style.getPropertyValue('--halftone-opacity')),
    );
    context.uniform1f(
      accentOpacityUniform,
      Number(style.getPropertyValue('--halftone-accent-opacity')),
    );
    context.uniform3f(
      accentRegionUniform,
      Number(style.getPropertyValue('--halftone-accent-center-y')),
      Number(style.getPropertyValue('--halftone-accent-radius-x')),
      Number(style.getPropertyValue('--halftone-accent-radius-y')),
    );
    context.uniform1f(
      edgeFadeUniform,
      Number(style.getPropertyValue('--halftone-edge-fade')),
    );
    const power =
      POWER +
      (reducedMotion.matches
        ? 0
        : POWER_AMPLITUDE *
          Math.sin((elapsed * 2 * Math.PI) / ANIMATION_PERIOD_MS));
    context.uniform1f(powerUniform, power);
    context.uniform1f(timeUniform, reducedMotion.matches ? 0 : elapsed / 1_000);
    context.drawArrays(context.TRIANGLES, 0, 3);
  };
  const animate = (timestamp: number) => {
    if (timestamp - previousFrame >= FRAME_INTERVAL_MS) {
      elapsed += Math.min(timestamp - previousFrame, 100);
      previousFrame = timestamp;
      draw();
    }
    animationFrame = window.requestAnimationFrame(animate);
  };
  const updateAnimation = () => {
    window.cancelAnimationFrame(animationFrame);
    if (document.hidden) return;
    draw();
    previousFrame = performance.now();
    if (!reducedMotion.matches)
      animationFrame = window.requestAnimationFrame(animate);
  };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    context.viewport(0, 0, canvas.width, canvas.height);
    context.uniform2f(viewportUniform, Math.max(width, 1), Math.max(height, 1));
    updateAnimation();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener('visibilitychange', updateAnimation);
  reducedMotion.addEventListener('change', updateAnimation);
  resize();

  return () => {
    window.cancelAnimationFrame(animationFrame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', updateAnimation);
    reducedMotion.removeEventListener('change', updateAnimation);
    disposeResources();
  };
};
