import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconPhoto, IconUpload, IconX } from '@/ui/icons';

import { Button } from '../buttons/Button';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

const SyledChip = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 12px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1)};
  text-decoration: none;
  :hover {
    filter: brightness(95%);
  }
  white-space: nowrap;
`;

const StyledIconX = styled(IconX)`
  cursor: pointer;
`;

const StyledName = styled.span`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const StyledLink = styled(Link)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  text-decoration: none;
`;

type Props = Omit<React.ComponentProps<'div'>, 'children'> & {
  picture: string | null | undefined;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
};

export function AttachmentsInput({
  picture,
  onUpload,
  onRemove,
  disabled = false,
  ...restProps
}: Props) {
  const theme = useTheme();
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);
  const onUploadButtonClick = () => {
    hiddenFileInput.current?.click();
  };

  return (
    <Container {...restProps}>
      <SyledChip>
        <StyledLink to="#">
          <IconPhoto size={theme.icon.size.md} />
          <StyledName>A very very long file name here</StyledName>
        </StyledLink>
        <StyledIconX onClick={onRemove} size={theme.icon.size.md} />
      </SyledChip>
      <SyledChip>
        <StyledLink to="#">
          <IconPhoto size={theme.icon.size.md} />
          <StyledName>A very very long file name here</StyledName>
        </StyledLink>
        <StyledIconX onClick={onRemove} size={theme.icon.size.md} />
      </SyledChip>
      <SyledChip>
        <StyledLink to="#">
          <IconPhoto />
          <StyledName>GHI</StyledName>
        </StyledLink>
        <StyledIconX onClick={onRemove} size={theme.icon.size.md} />
      </SyledChip>
      <StyledHiddenFileInput
        type="file"
        ref={hiddenFileInput}
        onChange={(event) => {
          if (onUpload) {
            if (event.target.files) {
              onUpload(event.target.files[0]);
            }
          }
        }}
      />
      <Button
        icon={<IconUpload size={theme.icon.size.sm} />}
        onClick={onUploadButtonClick}
        variant="tertiary"
        //title="Upload"
        size="small"
        disabled={disabled}
      />
    </Container>
  );
}
