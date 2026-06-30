import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

export const recordIndexOpenRecordInState = createAtomState<ViewOpenRecordIn>({
  key: 'recordIndexOpenRecordInState',
  defaultValue: ViewOpenRecordIn.SIDE_PANEL,
});
