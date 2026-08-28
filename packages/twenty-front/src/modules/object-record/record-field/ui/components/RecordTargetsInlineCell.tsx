import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { isDefined } from 'twenty-shared/utils';

type RecordTargetsInlineCellProps = {
  objectNameSingular: string;
  recordId: string;
  instanceIdPrefix: string;
  showLabel?: boolean;
};

export const RecordTargetsInlineCell = ({
  objectNameSingular,
  recordId,
  instanceIdPrefix,
  showLabel = false,
}: RecordTargetsInlineCellProps) => {
  const junctionConfig = useObjectMorphJunctionConfig({ objectNameSingular });

  if (!isDefined(junctionConfig)) {
    return null;
  }

  const junctionFieldName = junctionConfig.junctionField.name;

  return (
    <FieldContextProvider
      objectNameSingular={objectNameSingular}
      objectRecordId={recordId}
      fieldMetadataName={junctionFieldName}
      fieldPosition={0}
      showLabel={showLabel}
      isDisplayModeFixHeight
    >
      <RecordFieldsScopeContextProvider
        value={{ scopeInstanceId: instanceIdPrefix }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: getRecordFieldInputInstanceId({
              recordId,
              fieldName: junctionFieldName,
              prefix: instanceIdPrefix,
            }),
          }}
        >
          <RecordInlineCell instanceIdPrefix={instanceIdPrefix} />
        </RecordFieldComponentInstanceContext.Provider>
      </RecordFieldsScopeContextProvider>
    </FieldContextProvider>
  );
};
