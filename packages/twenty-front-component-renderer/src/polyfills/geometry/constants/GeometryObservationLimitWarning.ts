import { MAX_OBSERVED_GEOMETRY_ELEMENTS } from '@/constants/MaxObservedGeometryElements';

export const GEOMETRY_OBSERVATION_LIMIT_WARNING = `[twenty-front-component] Geometry observation limit reached (${MAX_OBSERVED_GEOMETRY_ELEMENTS} elements). getBoundingClientRect and offset/client/scroll metrics will report zero for additional elements. Reduce the number of measured elements, or virtualize long lists.`;
