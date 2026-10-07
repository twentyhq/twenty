const SCENE_VERTEX_SHADER = `#version 300 es
  in vec3 position;
  in vec3 normal;
  in vec4 instanceColumn0;
  in vec4 instanceColumn1;
  in vec4 instanceColumn2;
  in vec4 instanceColumn3;
  in float instanceAlbedo;

  uniform mat4 viewProjection;

  out vec3 worldNormal;
  out vec3 worldPosition;
  out float albedo;

  void main() {
    mat4 model = mat4(instanceColumn0, instanceColumn1, instanceColumn2, instanceColumn3);
    vec4 world = model * vec4(position, 1.0);
    worldPosition = world.xyz;
    worldNormal = transpose(inverse(mat3(model))) * normal;
    albedo = instanceAlbedo;
    gl_Position = viewProjection * world;
  }
`;

const SCENE_FRAGMENT_SHADER = `#version 300 es
  precision highp float;

  const float PI = 3.141592653589793;

  in vec3 worldNormal;
  in vec3 worldPosition;
  in float albedo;

  uniform vec3 keyLightDirection;
  uniform float keyLightIntensity;
  uniform vec3 fillLightDirection;
  uniform float fillLightIntensity;
  uniform float ambientIntensity;
  uniform float environmentIntensity;
  uniform float roughness;
  uniform float metalness;
  uniform vec3 cameraPosition;

  out vec4 fragmentColor;

  float getDistribution(float normalDotHalf, float alpha) {
    float alphaSquared = alpha * alpha;
    float denominator = normalDotHalf * normalDotHalf * (alphaSquared - 1.0) + 1.0;
    return alphaSquared / (PI * denominator * denominator);
  }

  float getVisibility(float normalDotLight, float normalDotView, float alpha) {
    float alphaSquared = alpha * alpha;
    float viewTerm = normalDotLight *
      sqrt(normalDotView * normalDotView * (1.0 - alphaSquared) + alphaSquared);
    float lightTerm = normalDotView *
      sqrt(normalDotLight * normalDotLight * (1.0 - alphaSquared) + alphaSquared);
    return 0.5 / max(viewTerm + lightTerm, 0.00001);
  }

  vec3 getFresnel(vec3 reflectance, float viewDotHalf) {
    float fresnel = exp2((-5.55473 * viewDotHalf - 6.98316) * viewDotHalf);
    return reflectance * (1.0 - fresnel) + fresnel;
  }

  vec3 getDirectLight(
    vec3 surfaceNormal,
    vec3 viewDirection,
    vec3 lightDirection,
    float intensity,
    vec3 diffuseColor,
    vec3 specularColor,
    float alpha
  ) {
    float normalDotLight = clamp(dot(surfaceNormal, lightDirection), 0.0, 1.0);
    vec3 halfVector = normalize(lightDirection + viewDirection);
    float normalDotHalf = clamp(dot(surfaceNormal, halfVector), 0.0, 1.0);
    float normalDotView = clamp(dot(surfaceNormal, viewDirection), 0.0001, 1.0);
    float viewDotHalf = clamp(dot(viewDirection, halfVector), 0.0, 1.0);
    vec3 specular = getFresnel(specularColor, viewDotHalf) *
      getVisibility(normalDotLight, normalDotView, alpha) *
      getDistribution(normalDotHalf, alpha);
    return normalDotLight * intensity * (diffuseColor / PI + specular);
  }

  float getEnvironmentRadiance(vec3 direction) {
    return 0.42 + 0.38 * direction.y;
  }

  void main() {
    vec3 surfaceNormal = normalize(worldNormal);
    vec3 viewDirection = normalize(cameraPosition - worldPosition);
    vec3 baseColor = vec3(albedo);
    vec3 diffuseColor = baseColor * (1.0 - metalness);
    vec3 specularColor = mix(vec3(0.04), baseColor, metalness);
    float alpha = roughness * roughness;

    vec3 radiance =
      getDirectLight(surfaceNormal, viewDirection, keyLightDirection, keyLightIntensity, diffuseColor, specularColor, alpha) +
      getDirectLight(surfaceNormal, viewDirection, fillLightDirection, fillLightIntensity, diffuseColor, specularColor, alpha) +
      diffuseColor * ambientIntensity / PI;

    float normalDotView = clamp(dot(surfaceNormal, viewDirection), 0.0, 1.0);
    vec3 reflected = reflect(-viewDirection, surfaceNormal);
    radiance += environmentIntensity * (
      diffuseColor * getEnvironmentRadiance(surfaceNormal) +
      getFresnel(specularColor, normalDotView) *
        getEnvironmentRadiance(reflected) * (1.0 - roughness * 0.5)
    );

    fragmentColor = vec4(clamp(radiance, 0.0, 1.0), 1.0);
  }
`;

const FULL_SCREEN_VERTEX_SHADER = `#version 300 es
  const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));

  void main() {
    gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
  }
`;

const HALFTONE_FRAGMENT_SHADER = `#version 300 es
  precision highp float;

  uniform sampler2D sceneTexture;
  uniform float sceneLod;
  uniform vec2 canvasSize;
  uniform float tileSize;
  uniform float power;
  uniform float width;
  uniform vec3 dashColor;
  uniform float dashScale;
  uniform float dashThreshold;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float scatterAmount;
  uniform vec3 contentColumn;
  uniform float contentColumnOpacity;
  uniform float dashOpacity;

  out vec4 fragmentColor;

  float getCapsuleDistance(vec2 cellPosition, float radius, float thickness) {
    vec2 segmentStart = vec2(0.5 - radius, 0.5);
    vec2 segment = vec2(2.0 * radius, 0.0);
    vec2 offset = cellPosition - segmentStart;
    float projection = clamp(
      dot(offset, segment) / max(dot(segment, segment), 0.000001),
      0.0,
      1.0
    );
    return length(offset - segment * projection) - thickness * radius;
  }

  float hash(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 effectPosition = gl_FragCoord.xy;
    float row = floor(effectPosition.y / tileSize);
    effectPosition.x += waveAmount * sin(time * waveSpeed + row * 0.5) * tileSize;

    vec2 cellIndex = floor(effectPosition / tileSize);
    vec2 cellPosition = fract(effectPosition / tileSize);
    vec2 cellCenter = (cellIndex + 0.5) * tileSize;
    vec2 scatterOffset =
      (vec2(hash(cellIndex), hash(cellIndex + 17.0)) - 0.5) * scatterAmount * 6.0;
    vec2 sampleCell = cellIndex + floor(scatterOffset + 0.5);
    vec4 sceneSample = textureLod(
      sceneTexture,
      clamp((sampleCell + 0.5) * tileSize / canvasSize, 0.0, 1.0),
      sceneLod
    );

    float columnDistance = abs(cellCenter.x - contentColumn.x) - contentColumn.y;
    float outsideColumn =
      smoothstep(-contentColumn.z, contentColumn.z, columnDistance);
    float belowContent =
      1.0 - smoothstep(canvasSize.y * 0.12, canvasSize.y * 0.24, cellCenter.y);

    float tone = (sceneSample.r + sceneSample.g + sceneSample.b) / 3.0;
    float toneLevel = clamp(tone + power * 0.2357, 0.0, 1.0);
    float radius =
      max(toneLevel - dashThreshold, 0.0) / (1.0 - dashThreshold) * dashScale;
    float signedDistance = getCapsuleDistance(cellPosition, radius, width);
    float edge = 0.5 * fwidth(signedDistance);
    float alpha =
      (1.0 - smoothstep(-edge, edge, signedDistance)) * step(0.0001, radius);
    alpha *= mix(contentColumnOpacity, 1.0, max(outsideColumn, belowContent));
    alpha *= dashOpacity;

    fragmentColor = vec4(dashColor * alpha, alpha);
  }
`;

export const ONBOARDING_CONSTRUCTION_SITE_SHADERS = {
  sceneVertex: SCENE_VERTEX_SHADER,
  sceneFragment: SCENE_FRAGMENT_SHADER,
  fullScreenVertex: FULL_SCREEN_VERTEX_SHADER,
  halftoneFragment: HALFTONE_FRAGMENT_SHADER,
};
