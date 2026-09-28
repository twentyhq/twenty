const ROUND_MESH_SEGMENT_COUNT = 48;

import { isDefined } from 'twenty-shared/utils';

type Vertex = readonly [number, number, number, number, number, number];

type Corner = readonly [number, number, number];

const toVertexData = (vertices: Vertex[]) => Float32Array.from(vertices.flat());

const buildCubeVertices = () => {
  const faces: {
    normal: readonly [number, number, number];
    corners: readonly [Corner, Corner, Corner, Corner];
  }[] = [
    {
      normal: [1, 0, 0],
      corners: [
        [0.5, -0.5, 0.5],
        [0.5, -0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5],
      ],
    },
    {
      normal: [-1, 0, 0],
      corners: [
        [-0.5, -0.5, -0.5],
        [-0.5, -0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5],
      ],
    },
    {
      normal: [0, 1, 0],
      corners: [
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, -0.5],
      ],
    },
    {
      normal: [0, -1, 0],
      corners: [
        [-0.5, -0.5, -0.5],
        [0.5, -0.5, -0.5],
        [0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5],
      ],
    },
    {
      normal: [0, 0, 1],
      corners: [
        [-0.5, -0.5, 0.5],
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5],
      ],
    },
    {
      normal: [0, 0, -1],
      corners: [
        [0.5, -0.5, -0.5],
        [-0.5, -0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5],
      ],
    },
  ];

  return toVertexData(
    faces.flatMap(({ normal, corners }) =>
      ([0, 1, 2, 0, 2, 3] as const).map(
        (cornerIndex): Vertex => [...corners[cornerIndex], ...normal],
      ),
    ),
  );
};

type RoundProfile = readonly (readonly [height: number, radius: number])[];

const buildRoundVertices = (profile: RoundProfile) => {
  const vertices: Vertex[] = [];
  const [firstProfilePoint] = profile;
  const lastProfilePoint = profile.at(-1);

  if (!isDefined(firstProfilePoint) || !isDefined(lastProfilePoint)) {
    return toVertexData(vertices);
  }

  for (let segment = 0; segment < ROUND_MESH_SEGMENT_COUNT; segment++) {
    const startAngle = (segment / ROUND_MESH_SEGMENT_COUNT) * Math.PI * 2;
    const endAngle = ((segment + 1) / ROUND_MESH_SEGMENT_COUNT) * Math.PI * 2;
    const startCosine = Math.cos(startAngle);
    const startSine = Math.sin(startAngle);
    const endCosine = Math.cos(endAngle);
    const endSine = Math.sin(endAngle);

    for (let ringIndex = 0; ringIndex < profile.length - 1; ringIndex++) {
      const bottomProfilePoint = profile[ringIndex];
      const topProfilePoint = profile[ringIndex + 1];

      if (!isDefined(bottomProfilePoint) || !isDefined(topProfilePoint)) {
        continue;
      }

      const [bottomHeight, bottomRadius] = bottomProfilePoint;
      const [topHeight, topRadius] = topProfilePoint;
      const slope = (bottomRadius - topRadius) / (topHeight - bottomHeight);
      const sideNormalLength = Math.hypot(1, slope);
      const sideNormal = (cosine: number, sine: number) =>
        [
          cosine / sideNormalLength,
          slope / sideNormalLength,
          sine / sideNormalLength,
        ] as const;

      const bottomStart: Vertex = [
        startCosine * bottomRadius,
        bottomHeight,
        startSine * bottomRadius,
        ...sideNormal(startCosine, startSine),
      ];
      const bottomEnd: Vertex = [
        endCosine * bottomRadius,
        bottomHeight,
        endSine * bottomRadius,
        ...sideNormal(endCosine, endSine),
      ];
      const topStart: Vertex = [
        startCosine * topRadius,
        topHeight,
        startSine * topRadius,
        ...sideNormal(startCosine, startSine),
      ];
      const topEnd: Vertex = [
        endCosine * topRadius,
        topHeight,
        endSine * topRadius,
        ...sideNormal(endCosine, endSine),
      ];

      vertices.push(
        bottomStart,
        topEnd,
        bottomEnd,
        bottomStart,
        topStart,
        topEnd,
      );
    }

    const [bottomHeight, bottomRadius] = firstProfilePoint;
    const [topHeight, topRadius] = lastProfilePoint;
    vertices.push(
      [0, bottomHeight, 0, 0, -1, 0],
      [
        endCosine * bottomRadius,
        bottomHeight,
        endSine * bottomRadius,
        0,
        -1,
        0,
      ],
      [
        startCosine * bottomRadius,
        bottomHeight,
        startSine * bottomRadius,
        0,
        -1,
        0,
      ],
    );

    if (topRadius > 0) {
      vertices.push(
        [0, topHeight, 0, 0, 1, 0],
        [startCosine * topRadius, topHeight, startSine * topRadius, 0, 1, 0],
        [endCosine * topRadius, topHeight, endSine * topRadius, 0, 1, 0],
      );
    }
  }

  return toVertexData(vertices);
};

export const ONBOARDING_CONSTRUCTION_SITE_MESHES = {
  cube: buildCubeVertices(),
  cylinder: buildRoundVertices([
    [-0.5, 0.47],
    [-0.47, 0.5],
    [0.47, 0.5],
    [0.5, 0.47],
  ]),
  cone: buildRoundVertices([
    [-0.5, 0.5],
    [0.5, 0],
  ]),
  mixerDrum: buildRoundVertices([
    [-0.5, 0.18],
    [-0.43, 0.2],
    [-0.2, 0.43],
    [-0.17, 0.48],
    [-0.1, 0.48],
    [-0.07, 0.46],
    [0.2, 0.46],
    [0.23, 0.49],
    [0.3, 0.49],
    [0.34, 0.44],
    [0.5, 0.28],
  ]),
};
