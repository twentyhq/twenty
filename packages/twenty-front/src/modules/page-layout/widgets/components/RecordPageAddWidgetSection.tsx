import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCreateRecordPageFieldWidget } from '@/page-layout/hooks/useCreateRecordPageFieldWidget';
import { useCreateRecordPageFieldsWidget } from '@/page-layout/hooks/useCreateRecordPageFieldsWidget';
import { useCreateRecordPageNoteWidget } from '@/page-layout/hooks/useCreateRecordPageNoteWidget';
import { useInsertCreatedWidgetAtContext } from '@/page-layout/hooks/useInsertCreatedWidgetAtContext';
import { useNavigateToMoreWidgets } from '@/page-layout/hooks/useNavigateToMoreWidgets';
import { type WidgetInsertionContext } from '@/page-layout/states/widgetInsertionContextComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconListDetails,
  IconListSearch,
  IconNotes,
  IconPlus,
} from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  height: ${themeCssVariables.spacing[6]};
  padding-inline: ${themeCssVariables.spacing[1]};
`;

const StyledMenuItemList = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-top: ${themeCssVariables.spacing[2]};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
`;

type RecordPageAddWidgetSectionProps = {
  insertionContext?: WidgetInsertionContext;
};

export const RecordPageAddWidgetSection = ({
  insertionContext = null,
}: RecordPageAddWidgetSectionProps) => {
  const { tabId } = usePageLayoutContentContext();

  const { createRecordPageFieldsWidget } = useCreateRecordPageFieldsWidget();

  const { createRecordPageFieldWidget } = useCreateRecordPageFieldWidget();

  const { createRecordPageNoteWidget } = useCreateRecordPageNoteWidget();

  const { navigateToMoreWidgets } = useNavigateToMoreWidgets();

  const { insertCreatedWidgetAtContext } = useInsertCreatedWidgetAtContext();

  const handleCreateWidget = (createWidget: () => PageLayoutWidget) => {
    const widget = createWidget();
    insertCreatedWidgetAtContext({ newWidgetId: widget.id, insertionContext });
  };

  return (
    <StyledContainer>
      <StyledHeader>{t`Add widget`}</StyledHeader>
      <StyledMenuItemList>
        <ListItem
          onClick={(event) => {
            event.preventDefault();
            handleCreateWidget(createRecordPageFieldsWidget);
          }}
          startIcon={<ListItemIcon icon={IconListDetails} container="soft" />}
          description={t`Group multiple fields from this record`}
        >{t`Fields group`}</ListItem>
        <ListItem
          onClick={(event) => {
            event.preventDefault();
            handleCreateWidget(createRecordPageFieldWidget);
          }}
          startIcon={<ListItemIcon icon={IconListSearch} container="soft" />}
          description={t`Single field with smart formats`}
        >{t`Field`}</ListItem>
        <ListItem
          onClick={(event) => {
            event.preventDefault();
            handleCreateWidget(() => createRecordPageNoteWidget({ tabId }));
          }}
          startIcon={<ListItemIcon icon={IconNotes} container="soft" />}
          description={t`Static text shared across all record pages`}
        >{t`Note`}</ListItem>
        <ListItem
          hasSubmenu
          onClick={(event) => {
            event.preventDefault();
            navigateToMoreWidgets(insertionContext);
          }}
          startIcon={<ListItemIcon icon={IconPlus} container="soft" />}
        >{t`More widgets`}</ListItem>
      </StyledMenuItemList>
    </StyledContainer>
  );
};
