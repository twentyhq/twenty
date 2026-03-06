import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';

import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { type IconComponent, IconTwentyStar } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsObjectFieldDataTypeProps = {
  to?: string;
  Icon?: IconComponent;
  label?: string;
  labelDetail?: string;
  value: SettingsFieldType;
  onClick?: (event: React.MouseEvent) => void;
};

const StyledDataType = styled.div<{
  value: SettingsFieldType;
  to?: string;
}>`
  align-items: center;
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ to }) =>
    to
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  cursor: ${({ to }) => (to ? 'pointer' : 'default')};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  height: 20px;
  overflow: hidden;
  text-decoration: ${({ to }) => (to ? 'underline' : 'none')};
  user-select: none;

  &:hover {
    color: ${({ to }) =>
      to
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.primary};
  }
`;

const StyledLabelContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledIconWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
`;

const StyledSpan = styled.span`
  color: ${themeCssVariables.font.color.extraLight};
`;
export const SettingsObjectFieldDataType = ({
  to,
  value,
  Icon: IconFromProps,
  label: labelFromProps,
  labelDetail,
  onClick,
}: SettingsObjectFieldDataTypeProps) => {
  const { theme } = useContext(ThemeContext);
  const fieldTypeConfig = getSettingsFieldTypeConfig(value);
  const Icon: IconComponent =
    IconFromProps ?? fieldTypeConfig?.Icon ?? IconTwentyStar;
  const label = labelFromProps ?? fieldTypeConfig?.label;

  return (
    <StyledDataType
      as={to ? Link : 'div'}
      to={to}
      value={value}
      onClick={onClick}
    >
      <StyledIconWrapper>
        <Icon size={theme.icon.size.sm} />
      </StyledIconWrapper>
      <StyledLabelContainer>
        {label} <StyledSpan>{labelDetail && `· ${labelDetail}`}</StyledSpan>
      </StyledLabelContainer>
    </StyledDataType>
  );
};
