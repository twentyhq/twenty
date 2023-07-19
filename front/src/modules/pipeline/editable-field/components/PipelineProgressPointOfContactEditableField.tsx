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
    pointOfContact?: Pick<Person, 'id' | 'firstName' | 'lastName'> | null;
  };
};

export function PipelineProgressPointOfContactEditableField({
  pipelineProgress,
}: OwnProps) {
  return (
    <RecoilScope SpecificContext={FieldContext}>
      <RecoilScope>
        <EditableField
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
                name={
                  pipelineProgress.pointOfContact?.firstName +
                  pipelineProgress.pointOfContact.lastName
                }
              />
            ) : (
              <></>
            )
          }
          isDisplayModeContentEmpty={!pipelineProgress.pointOfContact}
        />
      </RecoilScope>
    </RecoilScope>
  );
}
