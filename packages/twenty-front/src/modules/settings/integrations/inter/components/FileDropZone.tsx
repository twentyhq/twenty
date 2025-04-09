/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MainButton } from 'twenty-ui';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  position: relative;
  width: 100%;
`;

const StyledOverlay = styled.div`
  background: ${({ theme }) => theme.background.transparent.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  top: 0px;
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-align: left;
`;

const StyledFileName = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  word-break: break-all;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledDropzoneContent = styled.div`
  width: 100%;
`;

const StyledUploadDragSubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  margin-top: 10px;
`;

type FileDropZoneProps = {
  onFileSelected: (file: File) => void;
  onFileRemoved?: () => void;
  accept?: string;
  label: string;
  maxFileSize?: number;
  disabled?: boolean;
  file?: File | null;
};

export const FileDropZone = ({
  onFileSelected,
  onFileRemoved,
  accept = '.pem,.key,.crt,.cer',
  label,
  maxFileSize = 10 * 1024 * 1024,
  disabled = false,
  file,
}: FileDropZoneProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackBar } = useSnackBar();

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    maxSize: maxFileSize,
    accept: {
      'application/x-pem-file': ['.pem'],
      'application/x-x509-ca-cert': ['.crt', '.cer'],
      'application/octet-stream': ['.key'],
    },
    onDropRejected: (fileRejections) => {
      setIsLoading(false);
      fileRejections.forEach((fileRejection) => {
        enqueueSnackBar(`${fileRejection.file.name} upload rejected`, {
          detailedMessage: fileRejection.errors[0].message,
          variant: SnackBarVariant.Error,
        });
      });
    },
    onDropAccepted: async ([acceptedFile]) => {
      setIsLoading(true);
      try {
        onFileSelected(acceptedFile);
      } catch (error) {
        enqueueSnackBar('Error processing file', {
          variant: SnackBarVariant.Error,
        });
      } finally {
        setIsLoading(false);
      }
    },
    disabled,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFileRemoved) {
      onFileRemoved();
    }
  };

  return (
    <StyledContainer {...getRootProps()}>
      {isDragActive && <StyledOverlay />}
      <input {...getInputProps()} />

      <StyledDropzoneContent>
        <StyledLabel>{label}</StyledLabel>

        {isLoading ? (
          <div>Processing...</div>
        ) : file ? (
          <>
            <StyledFileName>{file.name}</StyledFileName>

            <StyledButtonContainer>
              <MainButton
                onClick={handleRemove}
                title="Remove"
                variant="secondary"
                fullWidth
              />
            </StyledButtonContainer>
          </>
        ) : (
          <>
            <MainButton
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
              title="Upload file"
              variant="secondary"
              disabled={disabled}
              fullWidth
            />
            <StyledUploadDragSubTitle>
              Upload the downloaded file here after configuring the integration
            </StyledUploadDragSubTitle>
          </>
        )}
      </StyledDropzoneContent>
    </StyledContainer>
  );
};
