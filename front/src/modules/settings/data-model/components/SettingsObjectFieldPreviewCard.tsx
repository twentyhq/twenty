import { ReactNode } from 'react';
import styled from '@emotion/styled';

type SettingsObjectFieldPreviewCardProps = {
  preview: ReactNode;
  form?: ReactNode;
};

const StyledPreviewContainer = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(4)};

  &:not(:last-child) {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledFormContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsObjectFieldPreviewCard = ({
  preview,
  form,
}: SettingsObjectFieldPreviewCardProps) => {
  return (
    <div>
      <StyledPreviewContainer>
        <StyledTitle>Preview</StyledTitle>
        {preview}
      </StyledPreviewContainer>
      {!!form && <StyledFormContainer>{form}</StyledFormContainer>}
    </div>
  );
};
