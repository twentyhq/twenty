import { useCreateRecordPageFieldWidget } from '@/page-layout/hooks/useCreateRecordPageFieldWidget';
import { useCreateRecordPageFieldsWidget } from '@/page-layout/hooks/useCreateRecordPageFieldsWidget';
import { useNavigateToMoreWidgets } from '@/page-layout/hooks/useNavigateToMoreWidgets';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import {
  IconListDetails,
  IconListSearch,
  IconPlus,
  IconSquarePlus,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding-inline: ${themeCssVariables.spacing[1]};
`;

const StyledMenuItemList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-top: ${themeCssVariables.spacing[2]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
`;

export const RecordPageAddWidgetSection = () => {
  const { theme } = useContext(ThemeContext);

  const { createRecordPageFieldsWidget } = useCreateRecordPageFieldsWidget();

  const { createRecordPageFieldWidget } = useCreateRecordPageFieldWidget();

  const { navigateToMoreWidgets } = useNavigateToMoreWidgets();

  return (
    <StyledContainer>
      <StyledHeader>
        <IconSquarePlus
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.md}
          color={theme.font.color.extraLight}
        />
        {t`Add widget`}
      </StyledHeader>
      <StyledMenuItemList>
        <MenuItem
          LeftIcon={IconListDetails}
          withIconContainer
          text={t`Fields group`}
          contextualText={t`Group multiple fields from this record`}
          onClick={createRecordPageFieldsWidget}
        />
        <MenuItem
          LeftIcon={IconListSearch}
          withIconContainer
          text={t`Field`}
          contextualText={t`Single field with smart formats`}
          onClick={createRecordPageFieldWidget}
        />
        <MenuItem
          LeftIcon={IconPlus}
          withIconContainer
          text={t`More widgets`}
          hasSubMenu
          onClick={navigateToMoreWidgets}
        />
      </StyledMenuItemList>
    </StyledContainer>
  );
};
