import styled from '@emotion/styled';

import { PipelineProgressPointOfContactPicker } from '@/pipeline/components/PipelineProgressPointOfContactPicker';
import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { Person, PipelineProgress } from '~/generated/graphql';

const PipelineProgressPointOfContactPickerContainer = styled.div`
  left: 24px;
  position: absolute;
  top: -8px;
`;

export type OwnProps = {
  pipelineProgress: Pick<PipelineProgress, 'id'> & {
    pointOfContact?: Pick<
      Person,
      'id' | 'firstName' | 'lastName' | 'displayName'
    > | null;
  };
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function PipelineProgressPointOfContactPickerFieldEditMode({
  pipelineProgress,
  onSubmit,
  onCancel,
}: OwnProps) {
  const { closeEditableField } = useEditableField();

  function handleSubmit() {
    closeEditableField();
    onSubmit?.();
  }

  function handleCancel() {
    closeEditableField();
    onCancel?.();
  }

  return (
    <PipelineProgressPointOfContactPickerContainer>
      <PipelineProgressPointOfContactPicker
        pipelineProgress={pipelineProgress}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </PipelineProgressPointOfContactPickerContainer>
  );
}
