import { useCreateRecordPageFieldWidget } from '@/page-layout/hooks/useCreateRecordPageFieldWidget';
import { useCreateRecordPageFieldsWidget } from '@/page-layout/hooks/useCreateRecordPageFieldsWidget';
import { useNavigateToMoreWidgets } from '@/page-layout/hooks/useNavigateToMoreWidgets';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconLayoutList, IconPlus, IconTextCaption } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${themeCssVariables.spacing[4]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledMenuItemList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

export const RecordPageAddWidgetSection = () => {
  const { theme } = useContext(ThemeContext);

  const { createRecordPageFieldsWidget } = useCreateRecordPageFieldsWidget();

  const { createRecordPageFieldWidget } = useCreateRecordPageFieldWidget();

  const { navigateToMoreWidgets } = useNavigateToMoreWidgets();

  return (
    <StyledContainer>
      <StyledHeader>
        <IconPlus size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        {t`Add widget`}
      </StyledHeader>
      <StyledMenuItemList>
        <MenuItem
          LeftIcon={IconLayoutList}
          text={t`Fields group`}
          onClick={createRecordPageFieldsWidget}
        />
        <MenuItem
          LeftIcon={IconTextCaption}
          text={t`Field`}
          onClick={createRecordPageFieldWidget}
        />
        <MenuItem
          LeftIcon={IconPlus}
          text={t`More widgets`}
          hasSubMenu
          onClick={navigateToMoreWidgets}
        />
      </StyledMenuItemList>
    </StyledContainer>
  );
};
