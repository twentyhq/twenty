import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconTrash, IconUpload } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledImagePreview = styled.div`
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
`;

type IconPickerImagePanelProps = {
  imageUrl?: string | null;
  onUploadClick: () => void;
  onRemove: () => void;
};

export const IconPickerImagePanel = ({
  imageUrl,
  onUploadClick,
  onRemove,
}: IconPickerImagePanelProps) => {
  const { t } = useLingui();
  const hasImage = isNonEmptyString(imageUrl);

  return (
    <>
      {hasImage && (
        <>
          <StyledImagePreview>
            <Avatar
              src={imageUrl}
              imageProps={{ alt: t`Current image` }}
              size="xxl"
              shape="circle"
            />
          </StyledImagePreview>
          <Dropdown.Separator />
        </>
      )}
      <Dropdown.Section>
        <Dropdown.ActionItem startIcon={<IconUpload />} onClick={onUploadClick}>
          {hasImage ? t`Replace image` : t`Upload image`}
        </Dropdown.ActionItem>
        {hasImage && (
          <Dropdown.ActionItem startIcon={<IconTrash />} onClick={onRemove}>
            {t`Remove image`}
          </Dropdown.ActionItem>
        )}
      </Dropdown.Section>
    </>
  );
};
