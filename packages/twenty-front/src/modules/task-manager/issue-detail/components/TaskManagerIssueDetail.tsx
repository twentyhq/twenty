import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { IconArrowLeft, IconBrowserMaximize, IconLink } from 'twenty-ui/icon';
import { LightIconButton, TabButton } from 'twenty-ui/components';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FilesCard } from '@/activities/files/components/FilesCard';
import { TimelineCard } from '@/activities/timeline-activities/components/TimelineCard';
import { TimelineActivityContext } from '@/activities/timeline-activities/contexts/TimelineActivityContext';
import { ObjectOptionsDropdown } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdown';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RichTextFieldEditor } from '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { TaskManagerFieldCell } from '@/task-manager/components/TaskManagerFieldCell';
import { IssueCommentThread } from '@/task-manager/issue-detail/components/IssueCommentThread';
import { IssueFieldPanel } from '@/task-manager/issue-detail/components/IssueFieldPanel';
import { IssueWorklogList } from '@/task-manager/issue-detail/components/IssueWorklogList';
import { useTaskManagerIssue } from '@/task-manager/issue-detail/hooks/useTaskManagerIssue';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { ResizablePanelGap } from '@/ui/layout/resizable-panel/components/ResizablePanelGap';
import { type ResizablePanelConstraints } from '@/ui/layout/resizable-panel/types/ResizablePanelConstraints';
import { ViewType } from '@/views/types/ViewType';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const RIGHT_COLUMN_WIDTH_CSS_VAR =
  '--task-manager-issue-detail-right-column-width';
const RIGHT_COLUMN_CONSTRAINTS: ResizablePanelConstraints = {
  min: 430,
  max: 560,
  default: 430,
};

const StyledPage = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  column-gap: ${themeCssVariables.spacing['2']};
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['4']};
  row-gap: ${themeCssVariables.spacing['2']};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['2']};
  justify-content: flex-end;
`;

const StyledIssueKey = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledHeaderDivider = styled.div`
  background: ${themeCssVariables.border.color.medium};
  height: ${themeCssVariables.spacing['4']};
  width: 1px;
`;

const StyledBody = styled.div<{ isInSidePanel: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: ${({ isInSidePanel }) => (isInSidePanel ? 'column' : 'row')};
  min-height: 0;
  overflow-y: ${({ isInSidePanel }) => (isInSidePanel ? 'auto' : 'hidden')};
`;

const StyledLeftColumn = styled.div<{ isInSidePanel: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['6']};
  min-height: 0;
  overflow-y: ${({ isInSidePanel }) => (isInSidePanel ? 'visible' : 'auto')};
  padding: ${themeCssVariables.spacing['4']};
`;

const StyledRightColumn = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
  overflow-y: auto;
  width: var(${RIGHT_COLUMN_WIDTH_CSS_VAR}, 320px);
`;

const StyledSidePanelFieldPanel = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledTitleWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSectionTitle = styled.h3`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0 0 ${themeCssVariables.spacing['2']} 0;
  text-transform: uppercase;
`;

const StyledDescriptionBox = styled.div`
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['3']};
  transition:
    background-color calc(${themeCssVariables.animation.duration.fast} * 1s),
    border-color calc(${themeCssVariables.animation.duration.fast} * 1s);

  & .editor {
    min-height: ${themeCssVariables.spacing['6']};
  }

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }

  &:focus-within {
    background-color: transparent;
    border-color: ${themeCssVariables.border.color.medium};
  }
`;

const StyledHeaderPill = styled.div`
  flex-shrink: 0;
`;

const StyledActivityTabs = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  margin-bottom: ${themeCssVariables.spacing['3']};
`;

type IssueStatusValue = { name?: string; color?: string } | null;

// IssueStatus.color is a free-text field (users can rename/recolor statuses
// per project), not a FieldMetadataType.SELECT option — so it isn't
// guaranteed to be a valid ThemeColor key. Normalize casing/whitespace since
// the seeded defaults ('gray', 'sky', 'purple', 'orange', 'green') are
// lowercase; Tag already falls back to gray for anything else unrecognized.
const getIssueStatusTagColor = (color: string | undefined): ThemeColor =>
  (color?.trim().toLowerCase() as ThemeColor | undefined) || 'gray';

type TaskManagerIssueDetailProps = {
  issueId: string;
  isInSidePanel?: boolean;
  focusedCommentId?: string;
  focusedWorklogId?: string;
};

export const TaskManagerIssueDetail = ({
  issueId,
  isInSidePanel = false,
  focusedCommentId,
  focusedWorklogId,
}: TaskManagerIssueDetailProps) => {
  const { t } = useLingui();
  const goToPage = useNavigate();
  const { issue } = useTaskManagerIssue(issueId);
  const { objectMetadataItem, recordIndexId } = useRecordIndexContextOrThrow();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { copyToClipboard } = useCopyToClipboard();

  const handlePopOutToFullPage = () => {
    closeSidePanelMenu();
    goToPage(getAppPath(AppPath.TaskManagerIssuePage, { issueId }));
  };

  const handleCopyIssueLink = () => {
    copyToClipboard(
      `${window.location.origin}${getAppPath(AppPath.TaskManagerIssuePage, { issueId })}`,
      t`Link copied to clipboard`,
    );
  };

  const [rightColumnWidth, setRightColumnWidth] = useState(
    RIGHT_COLUMN_CONSTRAINTS.default,
  );

  // A worklog permalink (opened via its "Copy link") should land on the Log
  // time tab even though Comment is the default landing tab.
  const [activityTab, setActivityTab] = useState<'comments' | 'worklogs'>(
    isDefined(focusedWorklogId) ? 'worklogs' : 'comments',
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      RIGHT_COLUMN_WIDTH_CSS_VAR,
      `${rightColumnWidth}px`,
    );
  }, [rightColumnWidth]);

  if (!issue) {
    return null;
  }

  const getField = (fieldName: string) =>
    objectMetadataItem.fields.find((field) => field.name === fieldName)!;

  const issueStatus = issue.status as IssueStatusValue;

  return (
    <StyledPage>
      <StyledHeader>
        <StyledHeaderLeft>
          {!isInSidePanel && (
            <LightIconButton
              Icon={IconArrowLeft}
              onClick={() => goToPage(-1)}
              accent="secondary"
            />
          )}
          <RecordFieldsScopeContextProvider
            value={{ scopeInstanceId: `issue-detail-header-type-${issueId}` }}
          >
            <StyledHeaderPill>
              <TaskManagerFieldCell
                recordId={issueId}
                fieldMetadataItem={getField('issueType')}
                objectMetadataItem={objectMetadataItem}
                instanceIdPrefix={`header-${recordIndexId}`}
                showLabel={false}
              />
            </StyledHeaderPill>
          </RecordFieldsScopeContextProvider>
          <StyledIssueKey>{issue.issueKey}</StyledIssueKey>
        </StyledHeaderLeft>
        <StyledHeaderRight>
          <RecordFieldsScopeContextProvider
            value={{
              scopeInstanceId: `issue-detail-header-priority-${issueId}`,
            }}
          >
            <StyledHeaderPill>
              <TaskManagerFieldCell
                recordId={issueId}
                fieldMetadataItem={getField('priority')}
                objectMetadataItem={objectMetadataItem}
                instanceIdPrefix={`header-${recordIndexId}`}
                showLabel={false}
              />
            </StyledHeaderPill>
          </RecordFieldsScopeContextProvider>
          <RecordFieldsScopeContextProvider
            value={{ scopeInstanceId: `issue-detail-header-status-${issueId}` }}
          >
            <StyledHeaderPill>
              <TaskManagerFieldCell
                recordId={issueId}
                fieldMetadataItem={getField('status')}
                objectMetadataItem={objectMetadataItem}
                instanceIdPrefix={`header-${recordIndexId}`}
                showLabel={false}
                customDisplay={
                  <Tag
                    text={issueStatus?.name ?? t`No status`}
                    color={
                      isDefined(issueStatus)
                        ? getIssueStatusTagColor(issueStatus.color)
                        : 'transparent'
                    }
                  />
                }
              />
            </StyledHeaderPill>
          </RecordFieldsScopeContextProvider>
          <StyledHeaderDivider />
          <LightIconButton
            Icon={IconLink}
            onClick={handleCopyIssueLink}
            accent="secondary"
            title={t`Copy link`}
          />
          {isInSidePanel && (
            <LightIconButton
              Icon={IconBrowserMaximize}
              onClick={handlePopOutToFullPage}
              accent="secondary"
              title={t`Open in full page`}
            />
          )}
          <ObjectOptionsDropdown
            objectMetadataItem={objectMetadataItem}
            recordIndexId={recordIndexId}
            viewType={ViewType.TABLE}
            dropdownId="task-manager-issue-detail-object-options-dropdown"
          />
        </StyledHeaderRight>
      </StyledHeader>
      <StyledBody isInSidePanel={isInSidePanel}>
        <StyledLeftColumn isInSidePanel={isInSidePanel}>
          <RecordFieldsScopeContextProvider
            value={{ scopeInstanceId: `issue-detail-title-${issueId}` }}
          >
            <StyledTitleWrapper>
              <TaskManagerFieldCell
                recordId={issueId}
                fieldMetadataItem={getField('title')}
                objectMetadataItem={objectMetadataItem}
                instanceIdPrefix={`title-${recordIndexId}`}
                showLabel={false}
              />
            </StyledTitleWrapper>
          </RecordFieldsScopeContextProvider>

          {isInSidePanel && (
            <StyledSidePanelFieldPanel>
              <IssueFieldPanel
                recordId={issueId}
                objectMetadataItem={objectMetadataItem}
                recordIndexId={recordIndexId}
              />
            </StyledSidePanelFieldPanel>
          )}

          <div>
            <StyledSectionTitle>
              <Trans>Description</Trans>
            </StyledSectionTitle>
            <StyledDescriptionBox>
              <RichTextFieldEditor
                recordId={issueId}
                objectNameSingular="issue"
                fieldName="description"
              />
            </StyledDescriptionBox>
          </div>

          <div>
            <StyledActivityTabs>
              <TabButton
                id="comments"
                title={t`Comment`}
                active={activityTab === 'comments'}
                onClick={() => setActivityTab('comments')}
              />
              <TabButton
                id="worklogs"
                title={t`Log time`}
                active={activityTab === 'worklogs'}
                onClick={() => setActivityTab('worklogs')}
              />
            </StyledActivityTabs>
            {activityTab === 'comments' ? (
              <IssueCommentThread
                issueId={issueId}
                focusedCommentId={focusedCommentId}
              />
            ) : (
              <IssueWorklogList
                issueId={issueId}
                focusedWorklogId={focusedWorklogId}
              />
            )}
          </div>

          <TimelineActivityContext.Provider value={{ recordId: issueId }}>
            <LayoutRenderingProvider
              value={{
                targetRecordIdentifier: {
                  id: issueId,
                  targetObjectNameSingular: 'issue',
                },
                layoutType: PageLayoutType.RECORD_PAGE,
                isInSidePanel,
              }}
            >
              <div>
                <StyledSectionTitle>
                  <Trans>Activity</Trans>
                </StyledSectionTitle>
                <TimelineCard />
              </div>
              <div>
                <StyledSectionTitle>{t`Files`}</StyledSectionTitle>
                <FilesCard />
              </div>
            </LayoutRenderingProvider>
          </TimelineActivityContext.Provider>
        </StyledLeftColumn>
        {!isInSidePanel && (
          <>
            <ResizablePanelGap
              side="left"
              constraints={RIGHT_COLUMN_CONSTRAINTS}
              currentWidth={rightColumnWidth}
              onWidthChange={setRightColumnWidth}
              onCollapse={() => {}}
              gapWidth={0}
              cssVariableName={RIGHT_COLUMN_WIDTH_CSS_VAR}
            />
            <StyledRightColumn>
              <IssueFieldPanel
                recordId={issueId}
                objectMetadataItem={objectMetadataItem}
                recordIndexId={recordIndexId}
              />
            </StyledRightColumn>
          </>
        )}
      </StyledBody>
    </StyledPage>
  );
};
