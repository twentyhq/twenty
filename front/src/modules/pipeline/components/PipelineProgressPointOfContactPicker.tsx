import { getOperationName } from '@apollo/client/utilities';
import { Key } from 'ts-key-enum';

import { useFilteredSearchPeopleQuery } from '@/people/queries';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';
import { SingleEntitySelect } from '@/ui/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/relation-picker/states/relationPickerSearchFilterScopedState';
import { RelationPickerHotkeyScope } from '@/ui/relation-picker/types/RelationPickerHotkeyScope';
import { isCreateModeScopedState } from '@/ui/table/editable-cell/states/isCreateModeScopedState';
import {
  Person,
  PipelineProgress,
  useUpdateOnePipelineProgressMutation,
} from '~/generated/graphql';

import { EntityForSelect } from '../../ui/relation-picker/types/EntityForSelect';
import { GET_PIPELINE_PROGRESS, GET_PIPELINES } from '../queries';

export type OwnProps = {
  pipelineProgress: Pick<PipelineProgress, 'id'> & {
    pointOfContact?: Pick<Person, 'id'> | null;
  };
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function PipelineProgressPointOfContactPicker({
  pipelineProgress,
  onSubmit,
  onCancel,
}: OwnProps) {
  const [, setIsCreating] = useRecoilScopedState(isCreateModeScopedState);

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updatePipelineProgress] = useUpdateOnePipelineProgressMutation();

  const people = useFilteredSearchPeopleQuery({
    searchFilter,
    selectedIds: pipelineProgress.pointOfContact?.id
      ? [pipelineProgress.pointOfContact.id]
      : [],
  });

  async function handleEntitySelected(entity: EntityForSelect) {
    await updatePipelineProgress({
      variables: {
        ...pipelineProgress,
        pointOfContactId: entity.id,
      },
      refetchQueries: [
        getOperationName(GET_PIPELINE_PROGRESS) ?? '',
        getOperationName(GET_PIPELINES) ?? '',
      ],
    });

    onSubmit?.();
  }

  function handleCreate() {
    setIsCreating(true);
    onSubmit?.();
  }

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel && onCancel();
    },
    RelationPickerHotkeyScope.RelationPicker,
    [],
  );

  return (
    <SingleEntitySelect
      onCreate={handleCreate}
      onEntitySelected={handleEntitySelected}
      entities={{
        entitiesToSelect: people.entitiesToSelect,
        selectedEntity: people.selectedEntities[0],
        loading: people.loading,
      }}
    />
  );
}
