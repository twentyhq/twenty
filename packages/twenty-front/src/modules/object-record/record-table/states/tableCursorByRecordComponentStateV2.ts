import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewScopeInternalContext } from '@/views/scopes/scope-internal-context/ViewScopeInternalContext';

// TODO: This is an example that can't be used because the context is not the same between RecordTable and RecordShowPage
// We should remove it when we have other examples of component family state V2
export const tableCursorByRecordIdComponentFamilyStateV2 =
  createComponentFamilyStateV2<string | null | undefined, string>({
    key: 'tableCursorByRecordIdComponentFamilyStateV2',
    defaultValue: null,
    componentContext: ViewScopeInternalContext,
  });
