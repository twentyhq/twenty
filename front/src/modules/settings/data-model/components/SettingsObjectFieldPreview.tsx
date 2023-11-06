import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { Tag } from '@/ui/display/tag/components/Tag';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';

type SettingsObjectFieldPreviewProps = {
  objectIconKey: string;
  objectLabelPlural: string;
  isObjectCustom: boolean;
  fieldIconKey: string;
  fieldLabel: string;
  fieldValue: ReactNode;
};

const StyledContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  max-width: 480px;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledObjectSummary = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledObjectName = styled.div`
  align-items: center;
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledFieldPreview = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(8)};
  overflow: hidden;
  padding-left: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsObjectFieldPreview = ({
  objectIconKey,
  objectLabelPlural,
  isObjectCustom,
  fieldIconKey,
  fieldLabel,
  fieldValue,
}: SettingsObjectFieldPreviewProps) => {
  const theme = useTheme();
  const { Icon: ObjectIcon } = useLazyLoadIcon(objectIconKey);
  const { Icon: FieldIcon } = useLazyLoadIcon(fieldIconKey);

  return (
    <StyledContainer>
      <StyledObjectSummary>
        <StyledObjectName>
          {!!ObjectIcon && (
            <ObjectIcon
              size={theme.icon.size.sm}
              stroke={theme.icon.stroke.sm}
            />
          )}
          {objectLabelPlural}
        </StyledObjectName>
        {isObjectCustom ? (
          <Tag color="orange" text="Custom" />
        ) : (
          <Tag color="blue" text="Standard" />
        )}
      </StyledObjectSummary>
      <StyledFieldPreview>
        <StyledFieldLabel>
          {!!FieldIcon && (
            <FieldIcon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          )}
          {fieldLabel}:
        </StyledFieldLabel>
        {fieldValue}
      </StyledFieldPreview>
    </StyledContainer>
  );
};
