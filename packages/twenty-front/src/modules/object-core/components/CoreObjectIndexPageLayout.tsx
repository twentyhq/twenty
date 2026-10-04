import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { IconPlus } from 'twenty-ui/icon';

import { RecordIndexEmptyStateDisplay } from '@/object-record/record-index/components/RecordIndexEmptyStateDisplay';
import { RecordIndexPageHeaderTitle } from '@/object-record/record-index/components/RecordIndexPageHeaderTitle';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { PageCardLayout } from '@/ui/layout/page/components/PageCardLayout';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

const StyledTableContainer = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const StyledFetchMoreSentinel = styled.div`
  height: 1px;
`;

type CoreObjectIndexPageEmptyState = {
  title: string;
  subTitle: string;
  hasAppliedFilters?: boolean;
  buttonTitle?: string;
  onButtonClick?: () => void;
};

type CoreObjectIndexPageLayoutProps = {
  labelPlural: string;
  icon: ReactNode;
  numberOfSelectedRecords?: number;
  actionButton?: ReactNode;
  isInitialLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
  emptyState: CoreObjectIndexPageEmptyState;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  children: ReactNode;
};

export const CoreObjectIndexPageLayout = ({
  labelPlural,
  icon,
  numberOfSelectedRecords = 0,
  actionButton,
  isInitialLoading,
  hasError,
  isEmpty,
  emptyState,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
  children,
}: CoreObjectIndexPageLayoutProps) => {
  const { t } = useLingui();
  const { ref: fetchMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onFetchNextPage?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onFetchNextPage]);

  return (
    <>
      <PageTitle title={labelPlural} />
      <PageCardLayout
        header={
          <PageCardHeader
            icon={icon}
            title={
              <RecordIndexPageHeaderTitle
                label={labelPlural}
                numberOfSelectedRecords={numberOfSelectedRecords}
              />
            }
            actionButton={actionButton}
          />
        }
      >
        <StyledTableContainer>
          {hasError && (
            <RecordIndexEmptyStateDisplay
              animatedPlaceholderType="errorIndex"
              title={t`Something went wrong`}
              subTitle={t`We could not load your ${labelPlural}. Please try again later.`}
            />
          )}
          {isEmpty && (
            <RecordIndexEmptyStateDisplay
              animatedPlaceholderType={
                emptyState.hasAppliedFilters === true
                  ? 'noMatchRecord'
                  : 'noRecord'
              }
              title={emptyState.title}
              subTitle={emptyState.subTitle}
              ButtonIcon={IconPlus}
              buttonTitle={emptyState.buttonTitle}
              onButtonClick={emptyState.onButtonClick}
            />
          )}
          {!isInitialLoading && !hasError && !isEmpty && (
            <>
              {children}
              {hasNextPage && <StyledFetchMoreSentinel ref={fetchMoreRef} />}
            </>
          )}
        </StyledTableContainer>
      </PageCardLayout>
    </>
  );
};
