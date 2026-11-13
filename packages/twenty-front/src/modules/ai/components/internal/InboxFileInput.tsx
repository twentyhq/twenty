import { useInboxFileUpload } from '@/ai/hooks/useInboxFileUpload';
import { styled } from '@linaria/react';
import { type ChangeEvent, type Ref } from 'react';

const StyledFileInput = styled.input`
  display: none;
`;

type InboxFileInputProps = {
  ref: Ref<HTMLInputElement>;
};

export const InboxFileInput = ({ ref }: InboxFileInputProps) => {
  const { uploadFiles } = useInboxFileUpload();

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const files = Array.from(event.target.files);

    uploadFiles(files);
    event.target.value = '';
  };

  return (
    <StyledFileInput
      ref={ref}
      type="file"
      multiple
      accept="*/*"
      onChange={handleFileInputChange}
    />
  );
};
