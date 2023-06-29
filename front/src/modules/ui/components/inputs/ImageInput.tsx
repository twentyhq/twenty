import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconFileUpload, IconTrash, IconUpload } from '@/ui/icons';

import { Button } from '../buttons/Button';

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Picture = styled.button<{ withPicture: boolean }>`
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

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin-left: ${({ theme }) => theme.spacing(4)};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(2)};
  }
`;

const Text = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

interface Props extends Omit<React.ComponentProps<'div'>, 'children'> {
  picture: string | null | undefined;
  onUpload?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

export function ImageInput({
  picture,
  onUpload,
  onRemove,
  disabled = false,
  ...restProps
}: Props) {
  const theme = useTheme();

  return (
    <Container {...restProps}>
      <Picture withPicture={!!picture} disabled={disabled} onClick={onUpload}>
        {picture ? (
          <img
            src={picture || '/images/default-profile-picture.png'}
            alt="profile"
          />
        ) : (
          <IconFileUpload size={theme.icon.size.md} />
        )}
      </Picture>
      <Content>
        <ButtonContainer>
          <Button
            icon={<IconUpload size={theme.icon.size.sm} />}
            onClick={onUpload}
            variant="secondary"
            title="Upload"
            disabled={disabled}
            fullWidth
          />
          <Button
            icon={<IconTrash size={theme.icon.size.sm} />}
            onClick={onRemove}
            variant="secondary"
            title="Remove"
            disabled={!picture || disabled}
            fullWidth
          />
        </ButtonContainer>
        <Text>
          We support your best PNGs, JPEGs and GIFs portraits under 10MB
        </Text>
      </Content>
    </Container>
  );
}
