import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { PageLayoutFilterValueInput } from '@/page-layout/components/PageLayoutFilterValueInput';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { isPageLayoutFilterBoundByReadOnlyWidget } from '@/page-layout/utils/isPageLayoutFilterBoundByReadOnlyWidget';
import { removePageLayoutFilterFromDraft } from '@/page-layout/utils/removePageLayoutFilterFromDraft';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconButton } from 'twenty-ui/components/input';
import { IconTrash } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { type PageLayoutFilter } from '~/generated-metadata/graphql';

const StyledCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledLabelRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type DashboardFilterSettingsCardProps = {
  pageLayoutId: string;
  pageLayoutFilter: PageLayoutFilter;
};

export const DashboardFilterSettingsCard = ({
  pageLayoutId,
  pageLayoutFilter,
}: DashboardFilterSettingsCardProps) => {
  const { t } = useLingui();

  const setPageLayoutDraft = useSetAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const updatePageLayoutFilter = (
    pageLayoutFilterUpdate: Partial<PageLayoutFilter>,
  ) => {
    setPageLayoutDraft((pageLayoutDraft) => ({
      ...pageLayoutDraft,
      filters: (pageLayoutDraft.filters ?? []).map((filter) =>
        filter.id === pageLayoutFilter.id
          ? { ...filter, ...pageLayoutFilterUpdate }
          : filter,
      ),
    }));
  };

  const handleLabelBlur = () => {
    if (!isNonEmptyString(pageLayoutFilter.label.trim())) {
      updatePageLayoutFilter({ label: t`Period` });
    }
  };

  const handleRemove = () => {
    setPageLayoutDraft((pageLayoutDraft) =>
      removePageLayoutFilterFromDraft({
        pageLayoutDraft,
        pageLayoutFilterId: pageLayoutFilter.id,
      }),
    );
  };

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const isRemoveDisabled = isPageLayoutFilterBoundByReadOnlyWidget({
    pageLayoutFilterId: pageLayoutFilter.id,
    persistedWidgets: (pageLayoutPersisted?.tabs ?? []).flatMap(
      (tab) => tab.widgets,
    ),
    currentWorkspace,
  });

  const removeFilterLabel = t`Remove filter`;

  return (
    <Card.Root fullWidth>
      <Card.Content>
        <StyledCardBody>
          <StyledLabelRow>
            <TextInput
              label={t`Label`}
              value={pageLayoutFilter.label}
              onChange={(label) => updatePageLayoutFilter({ label })}
              onBlur={handleLabelBlur}
              fullWidth
            />
            <IconButton
              variant="outline"
              tooltip={
                isRemoveDisabled
                  ? t`An app's widget uses this filter, so it can't be removed`
                  : removeFilterLabel
              }
              aria-label={removeFilterLabel}
              disabled={isRemoveDisabled}
              onClick={handleRemove}
            >
              <IconTrash />
            </IconButton>
          </StyledLabelRow>
          <PageLayoutFilterValueInput
            label={t`Default value`}
            emptyValueLabel={t`No default`}
            value={pageLayoutFilter.defaultValue}
            onChange={(defaultValue) =>
              updatePageLayoutFilter({ defaultValue })
            }
          />
        </StyledCardBody>
      </Card.Content>
    </Card.Root>
  );
};
