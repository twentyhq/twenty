import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Button } from '@/ui/button/components/Button';
import { IconFileUpload, IconTrash, IconUpload, IconX } from '@/ui/icon';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledPicture = styled.button<{ withPicture: boolean }>`
  align-items: center;
  background: ${({ theme, disabled }) =>
    disabled ? theme.background.secondary : theme.background.tertiary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  height: 66px;
  justify-content: center;
  overflow: hidden;
  padding: 0;
  transition: background 0.1s ease;

  width: 66px;

  img {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  ${({ theme, withPicture, disabled }) => {
    if (withPicture || disabled) {
      return '';
    }

    return `
      &:hover {
        background: ${theme.background.quaternary};
      }
    `;
  }};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin-left: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(2)};
  }
`;

const StyledText = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledErrorText = styled.span`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

type ImageInputProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  picture: string | null | undefined;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  onAbort?: () => void;
  isUploading?: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
};

export const ImageInput = ({
  picture,
  onUpload,
  onRemove,
  onAbort,
  isUploading = false,
  errorMessage,
  disabled = false,
  ...restProps
}: ImageInputProps) => {
  const theme = useTheme();
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const onUploadButtonClick = () => {
    hiddenFileInput.current?.click();
  };

  return (
    // eslint-disable-next-line twenty/no-spread-props
    <StyledContainer {...restProps}>
      <StyledPicture
        withPicture={!!picture}
        disabled={disabled}
        onClick={onUploadButtonClick}
      >
        {picture ? (
          <img
            src={picture || '/images/default-profile-picture.png'}
            alt="profile"
          />
        ) : (
          <IconFileUpload size={theme.icon.size.md} />
        )}
      </StyledPicture>
      <StyledContent>
        <StyledButtonContainer>
          <StyledHiddenFileInput
            type="file"
            ref={hiddenFileInput}
            accept="image/jpeg, image/png, image/gif" // to desired specification
            onChange={(event) => {
              if (onUpload) {
                if (event.target.files) {
                  onUpload(event.target.files[0]);
                }
              }
            }}
          />
          {isUploading && onAbort ? (
            <Button
              Icon={IconX}
              onClick={onAbort}
              variant="secondary"
              title="Abort"
              disabled={!picture || disabled}
              fullWidth
            />
          ) : (
            <Button
              Icon={IconUpload}
              onClick={onUploadButtonClick}
              variant="secondary"
              title="Upload"
              disabled={disabled}
              fullWidth
            />
          )}
          <Button
            Icon={IconTrash}
            onClick={onRemove}
            variant="secondary"
            title="Remove"
            disabled={!picture || disabled}
            fullWidth
          />
        </StyledButtonContainer>
        <StyledText>
          We support your best PNGs, JPEGs and GIFs portraits under 10MB
        </StyledText>
        {errorMessage && <StyledErrorText>{errorMessage}</StyledErrorText>}
      </StyledContent>
    </StyledContainer>
  );
};
