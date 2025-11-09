import { atom } from 'recoil';

export type EnrichmentFieldSelectionData = {
  isOpen: boolean;
  companyId: string | null;
  companyName: string | null;
  availableFields: string[];
};

export const enrichmentFieldSelectionState = atom<EnrichmentFieldSelectionData>(
  {
    key: 'enrichmentFieldSelectionState',
    default: {
      isOpen: false,
      companyId: null,
      companyName: null,
      availableFields: [],
    },
  },
);
