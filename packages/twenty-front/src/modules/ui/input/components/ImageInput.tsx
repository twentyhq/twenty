import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';

import { isNonEmptyString } from '@sniptt/guards';
import React, { useContext, useState } from 'react';
import { getImageAbsoluteURI, isDefined } from 'twenty-shared/utils';
import { IconPhotoUp, IconTrash, IconUpload, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledPicture = styled.button<{ withPicture: boolean }>`
  align-items: center;
  background: ${({ disabled }) =>
    disabled
      ? themeCssVariables.background.secondary
      : themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
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

  &:hover svg {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &:hover {
    background: ${({ withPicture, disabled }) =>
      withPicture || disabled
        ? 'transparent'
        : themeCssVariables.background.transparent.medium};
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: start;

  margin-left: ${themeCssVariables.spacing[4]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;

  gap: ${themeCssVariables.spacing[2]};
`;

const StyledText = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledErrorText = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
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
  className?: string;
};

export const ImageInput = ({
  picture,
  onUpload,
  onRemove,
  onAbort,
  isUploading = false,
  errorMessage,
  disabled = false,
  className,
}: ImageInputProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const onUploadButtonClick = () => {
    hiddenFileInput.current?.click();
  };
  const [isPictureURLError, setIsPictureURLError] = useState(false);

  const pictureURI = isNonEmptyString(picture)
    ? getImageAbsoluteURI({
        imageUrl: picture,
        baseUrl: REACT_APP_SERVER_BASE_URL,
      })
    : null;

  return (
    <StyledContainer className={className}>
      <StyledPicture
        withPicture={!!pictureURI}
        disabled={disabled}
        onClick={onUploadButtonClick}
      >
        {pictureURI && !isPictureURLError ? (
          <img
            src={pictureURI}
            alt="profile"
            onError={() => {
              setIsPictureURLError(true);
            }}
          />
        ) : (
          <IconPhotoUp size={theme.icon.size.lg} />
        )}
      </StyledPicture>
      <StyledContent>
        <StyledButtonContainer>
          <StyledHiddenFileInput
            type="file"
            ref={hiddenFileInput}
            accept="image/jpeg, image/png, image/gif" // to desired specification
            onChange={(event) => {
              if (isDefined(onUpload) && isDefined(event.target.files)) {
                onUpload(event.target.files[0]);
              }
            }}
          />
          {isUploading && onAbort ? (
            <Button
              Icon={IconX}
              onClick={onAbort}
              variant="secondary"
              title={t`Abort`}
              disabled={!pictureURI || disabled}
            />
          ) : (
            <Button
              Icon={IconUpload}
              onClick={onUploadButtonClick}
              variant="secondary"
              title={t`Upload`}
              disabled={disabled}
            />
          )}
          <Button
            Icon={IconTrash}
            onClick={onRemove}
            variant="secondary"
            title={t`Remove`}
            disabled={!pictureURI || disabled}
          />
        </StyledButtonContainer>
        <StyledText>
          <Trans>We support your square PNGs, JPEGs and GIFs under 10MB</Trans>
        </StyledText>
        {errorMessage && <StyledErrorText>{errorMessage}</StyledErrorText>}
      </StyledContent>
    </StyledContainer>
  );
};
