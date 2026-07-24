import { type FrontComponentExternalLinkModalConfig } from '@/front-components/types/FrontComponentExternalLinkModalConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const frontComponentExternalLinkModalConfigState =
  createAtomState<FrontComponentExternalLinkModalConfig | null>({
    key: 'frontComponentExternalLinkModalConfigState',
    defaultValue: null,
  });
