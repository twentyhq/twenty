import { useUploadAttachmentFiles } from '@/activities/files/hooks/useUploadAttachmentFiles';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { styled } from '@linaria/react';
import { type ChangeEvent, type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledFileInput = styled.input`
  display: none;
`;

type AttachmentFileInputProps = {
  ref?: Ref<HTMLInputElement>;
  targetableObject: ActivityTargetableObject;
  onUploadComplete?: () => void;
};

export const AttachmentFileInput = ({
  ref,
  targetableObject,
  onUploadComplete,
}: AttachmentFileInputProps) => {
  const { uploadAttachmentFiles } = useUploadAttachmentFiles();

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (isDefined(event.target.files)) {
      const files = Array.from(event.target.files);
      event.target.value = '';
      await uploadAttachmentFiles({ files, targetableObject });
      onUploadComplete?.();
    }
  };

  return (
    <StyledFileInput
      ref={ref}
      onChange={handleFileInputChange}
      type="file"
      multiple
    />
  );
};
