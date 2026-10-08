import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { OnDemandRecordCardStory } from '@/object-record/record-field/on-demand/testing/OnDemandRecordCardStory';
import { OnDemandRecordTableStory } from '@/object-record/record-field/on-demand/testing/OnDemandRecordTableStory';
import {
  ON_DEMAND_FIELD_STORY_EDITABLE_INDEX_CONTEXT,
  ON_DEMAND_FIELD_STORY_INDEX_CONTEXT,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandCollectionFieldStory';
import {
  ON_DEMAND_FIELD_STORY_DEFINITION,
  ON_DEMAND_FIELD_STORY_EDITABLE_DEFINITION,
  ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA,
  ON_DEMAND_FIELD_STORY_OBJECT_METADATA,
  ON_DEMAND_FIELD_STORY_RECORD_ID,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusStaticUnfocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordIndexContextProvider } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { RecordListFieldTooltip } from '@/object-record/record-list/components/RecordListFieldTooltip';
import { RecordListRow } from '@/object-record/record-list/components/RecordListRow';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

type OnDemandCollectionFieldStoryProps = {
  surface?: 'cell' | 'inline' | 'list' | 'table' | 'board' | 'calendar';
  isForbidden?: boolean;
  isEditable?: boolean;
  onRecordClick?: () => void;
};

export const OnDemandCollectionFieldStory = ({
  surface = 'cell',
  isForbidden = false,
  isEditable = false,
  onRecordClick,
}: OnDemandCollectionFieldStoryProps) => {
  const objectMetadataItem = isEditable
    ? ON_DEMAND_FIELD_STORY_EDITABLE_OBJECT_METADATA
    : ON_DEMAND_FIELD_STORY_OBJECT_METADATA;
  const renderField = () => {
    if (surface === 'inline') {
      return (
        <FieldFocusStaticUnfocusedProvider>
          <RecordInlineCellContext.Provider value={{ readonly: true }}>
            <RecordInlineCellValue />
          </RecordInlineCellContext.Provider>
        </FieldFocusStaticUnfocusedProvider>
      );
    }

    if (surface === 'list') {
      return (
        <RecordListFieldTooltip>
          <div style={{ width: 600 }}>
            <RecordListRow recordId={ON_DEMAND_FIELD_STORY_RECORD_ID} />
          </div>
        </RecordListFieldTooltip>
      );
    }

    if (surface === 'table') {
      return (
        <OnDemandRecordTableStory
          recordId={ON_DEMAND_FIELD_STORY_RECORD_ID}
          objectMetadataItem={objectMetadataItem}
        />
      );
    }

    if (surface === 'board' || surface === 'calendar') {
      return (
        <OnDemandRecordCardStory
          surface={surface}
          recordId={ON_DEMAND_FIELD_STORY_RECORD_ID}
          objectMetadataItem={objectMetadataItem}
        />
      );
    }

    return <FieldDisplay />;
  };

  return (
    <PreComputedChipGeneratorsProvider>
      <RecordIndexContextProvider
        value={
          isEditable
            ? ON_DEMAND_FIELD_STORY_EDITABLE_INDEX_CONTEXT
            : ON_DEMAND_FIELD_STORY_INDEX_CONTEXT
        }
      >
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: 'on-demand-story' }}
        >
          <RecordTableComponentInstanceContext.Provider
            value={{ instanceId: 'on-demand-story' }}
          >
            <ViewComponentInstanceContext.Provider
              value={{ instanceId: 'on-demand-story' }}
            >
              <RecordComponentInstanceContextsWrapper componentInstanceId="on-demand-story">
                <FieldContext.Provider
                  value={{
                    recordId: ON_DEMAND_FIELD_STORY_RECORD_ID,
                    fieldDefinition: isEditable
                      ? ON_DEMAND_FIELD_STORY_EDITABLE_DEFINITION
                      : ON_DEMAND_FIELD_STORY_DEFINITION,
                    isLabelIdentifier: false,
                    isRecordFieldReadOnly: true,
                    isOnDemand: true,
                    isForbidden,
                  }}
                >
                  <div onClick={onRecordClick}>{renderField()}</div>
                </FieldContext.Provider>
              </RecordComponentInstanceContextsWrapper>
            </ViewComponentInstanceContext.Provider>
          </RecordTableComponentInstanceContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </RecordIndexContextProvider>
    </PreComputedChipGeneratorsProvider>
  );
};
