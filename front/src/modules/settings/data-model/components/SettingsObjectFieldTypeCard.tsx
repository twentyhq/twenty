import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { Card } from '@/ui/layout/card/components/Card';

type SettingsObjectFieldTypeCardProps = {
  className?: string;
  preview: ReactNode;
  form?: ReactNode;
};

const StyledPreviewContainer = styled(Card)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
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

const StyledPreviewContent = styled.div`
  display: flex;
  gap: 6px;
`;

const StyledFormContainer = styled(Card)`
  border-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  overflow: hidden;
  padding: 0;
`;

export const SettingsObjectFieldTypeCard = ({
  className,
  preview,
  form,
}: SettingsObjectFieldTypeCardProps) => {
  return (
    <div className={className}>
      <StyledPreviewContainer>
        <StyledTitle>Preview</StyledTitle>
        <StyledPreviewContent>{preview}</StyledPreviewContent>
      </StyledPreviewContainer>
      {!!form && <StyledFormContainer>{form}</StyledFormContainer>}
    </div>
  );
};
