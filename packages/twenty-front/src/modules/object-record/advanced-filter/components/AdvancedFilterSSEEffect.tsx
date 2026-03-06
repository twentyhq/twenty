import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const AdvancedFilterSSEEffect = () => {
  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewFilterGroup,
    onMetadataOperationBrowserEvent: () => {
      setAdvancedFilterDropdownStates();
    },
  });

  return null;
};
