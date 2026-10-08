import { OnDemandJsonFieldDisplay } from '@/object-record/record-field/on-demand/components/OnDemandJsonFieldDisplay';
import {
  ON_DEMAND_FIELD_STORY_DEFINITION,
  ON_DEMAND_FIELD_STORY_RECORD_ID,
} from '@/object-record/record-field/on-demand/testing/seedOnDemandFieldStory';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

type OnDemandFieldStoryProps = {
  isForbidden?: boolean;
  onRecordClick?: () => void;
};

export const OnDemandFieldStory = ({
  isForbidden = false,
  onRecordClick,
}: OnDemandFieldStoryProps) => {
  return (
    <FieldContext.Provider
      value={{
        recordId: ON_DEMAND_FIELD_STORY_RECORD_ID,
        fieldDefinition: ON_DEMAND_FIELD_STORY_DEFINITION,
        isLabelIdentifier: false,
        isRecordFieldReadOnly: true,
        isForbidden,
      }}
    >
      <div onClick={onRecordClick}>
        <OnDemandJsonFieldDisplay />
      </div>
    </FieldContext.Provider>
  );
};
