import {
  type CrmFeatureId,
  type PendingModuleStructure,
} from 'src/modules/crm-acceleration/types/crm-acceleration.types';

const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

const without = (items: number[], excluded: number[]): number[] =>
  items.filter((item) => !excluded.includes(item));

export const CRM_PENDING_MODULES: PendingModuleStructure[] = [
  {
    module: 'M1',
    title: 'Inteligencia Artificial & Machine Learning',
    pendingFeatureIds: without(range(1, 16), [1, 11]),
    completionPhase: 'phase-2',
  },
  {
    module: 'M2',
    title: 'Comunicacion Omnicanal',
    pendingFeatureIds: without(range(17, 28), [23, 25]),
    completionPhase: 'phase-2',
  },
  {
    module: 'M3',
    title: 'BI, Analytics y Revenue Intelligence',
    pendingFeatureIds: without(range(29, 40), [33, 40]),
    completionPhase: 'phase-2',
  },
  {
    module: 'M4',
    title: 'AI Agents Autonomos',
    pendingFeatureIds: range(41, 48),
    completionPhase: 'phase-3',
  },
  {
    module: 'M5',
    title: 'Sales Execution & Pipeline Management',
    pendingFeatureIds: without(range(49, 58), [49, 50, 51, 52, 53, 54, 55, 56, 57, 58]),
    completionPhase: 'phase-2',
  },
  {
    module: 'M6',
    title: 'Customer Success & Retencion',
    pendingFeatureIds: without(range(59, 66), [59, 60, 61, 62, 63, 64]),
    completionPhase: 'phase-3',
  },
  {
    module: 'M7',
    title: 'CPQ, Contratos y Revenue Operations',
    pendingFeatureIds: range(67, 74),
    completionPhase: 'phase-3',
  },
  {
    module: 'M8',
    title: 'Account-Based Marketing (ABM)',
    pendingFeatureIds: range(75, 80),
    completionPhase: 'phase-3',
  },
  {
    module: 'M9',
    title: 'Personalizacion & Developer Experience',
    pendingFeatureIds: without(range(81, 88), [85]),
    completionPhase: 'phase-2',
  },
  {
    module: 'M10',
    title: 'Seguridad, Compliance & Enterprise',
    pendingFeatureIds: without(range(89, 96), [91, 94]),
    completionPhase: 'phase-3',
  },
  {
    module: 'M11',
    title: 'Mobile, Geolocalizacion & Field Sales',
    pendingFeatureIds: range(97, 100),
    completionPhase: 'phase-4',
  },
  {
    module: 'BONUS',
    title: 'Features Verticales por Industria',
    pendingFeatureIds: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8'],
    completionPhase: 'phase-4',
  },
];

export const getPendingFeatureSet = (): Set<CrmFeatureId> => {
  const pendingIds = CRM_PENDING_MODULES.flatMap(
    (moduleEntry) => moduleEntry.pendingFeatureIds,
  );

  return new Set<CrmFeatureId>(pendingIds);
};
