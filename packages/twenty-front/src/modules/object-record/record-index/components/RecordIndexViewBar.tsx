import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { RecordIndexViewBarEffect } from '@/object-record/record-index/components/RecordIndexViewBarEffect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHasCurrentViewNonReadableFields } from '@/object-record/record-index/hooks/useHasCurrentViewNonReadableFields';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ViewBar } from '@/views/components/ViewBar';
import { ViewType } from '@/views/types/ViewType';

export const RecordIndexViewBar = () => {
  const recordIndexViewType = useAtomStateValue(recordIndexViewTypeState);

  const { objectNamePlural, recordIndexId, objectMetadataItem } =
    useRecordIndexContextOrThrow();

  const { hasCurrentViewNonReadableFields } =
    useHasCurrentViewNonReadableFields(objectMetadataItem);

  return (
    <SpreadsheetImportProvider>
      <ViewBar
        isReadOnly={hasCurrentViewNonReadableFields}
        viewBarId={recordIndexId}
        optionsDropdownButton={
          <ObjectOptionsDropdown
            recordIndexId={recordIndexId}
            objectMetadataItem={objectMetadataItem}
            viewType={recordIndexViewType ?? ViewType.TABLE}
          />
        }
      />
      <RecordIndexViewBarEffect
        objectNamePlural={objectNamePlural}
        viewBarId={recordIndexId}
      />
    </SpreadsheetImportProvider>
  );
};
