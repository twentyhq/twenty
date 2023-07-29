import { PersonChip } from '@/people/components/PersonChip';
import { EditableField } from '@/ui/editable-field/components/EditableField';
import { FieldContext } from '@/ui/editable-field/states/FieldContext';
import { IconUser } from '@/ui/icon';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { Person, PipelineProgress } from '~/generated/graphql';

import { PipelineProgressPointOfContactPickerFieldEditMode } from './PipelineProgressPointOfContactPickerFieldEditMode';

type OwnProps = {
  pipelineProgress: Pick<PipelineProgress, 'id' | 'pointOfContactId'> & {
    pointOfContact?: Pick<Person, 'id' | 'displayName' | 'avatarUrl'> | null;
  };
};

export function PipelineProgressPointOfContactEditableField({
  pipelineProgress,
}: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
          useEditButton
          customEditHotkeyScope={{
            scope: RelationPickerHotkeyScope.RelationPicker,
          }}
          iconLabel={<IconUser />}
          editModeContent={
            <PipelineProgressPointOfContactPickerFieldEditMode
              pipelineProgress={pipelineProgress}
            />
          }
          displayModeContent={
            pipelineProgress.pointOfContact ? (
              <PersonChip
                id={pipelineProgress.pointOfContact.id}
                name={pipelineProgress.pointOfContact.displayName}
                pictureUrl={
                  pipelineProgress.pointOfContact.avatarUrl ?? undefined
                }
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!pipelineProgress.pointOfContact}
          isDisplayModeFixHeight
        />
      </RecoilScope>
    </RecoilScope>
  );
}
