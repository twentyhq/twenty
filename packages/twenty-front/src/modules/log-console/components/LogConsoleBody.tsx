import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { lazy, type ReactNode, Suspense, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ResizeHandle } from 'twenty-ui/primitives/layout';

import { LogConsoleApiKeyDetail } from '@/log-console/components/LogConsoleApiKeyDetail';
import { LogConsoleApiKeyNew } from '@/log-console/components/LogConsoleApiKeyNew';
import { LogConsoleApiKeys } from '@/log-console/components/LogConsoleApiKeys';
import { LogConsoleCli } from '@/log-console/components/LogConsoleCli';
import { LogConsoleCliGetStarted } from '@/log-console/components/LogConsoleCliGetStarted';
import { LogConsoleDetailPanel } from '@/log-console/components/LogConsoleDetailPanel';
import { LogConsoleLogs } from '@/log-console/components/LogConsoleLogs';
import { LogConsoleWebhookForm } from '@/log-console/components/LogConsoleWebhookForm';
import { LogConsoleWebhooks } from '@/log-console/components/LogConsoleWebhooks';
import { LOG_CONSOLE_NARROW_BODY_MAX_WIDTH } from '@/log-console/constants/LogConsoleNarrowBodyMaxWidth';
import { isLogConsoleCliGuideOpenState } from '@/log-console/states/isLogConsoleCliGuideOpenState';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { logConsoleWebhooksViewState } from '@/log-console/states/logConsoleWebhooksViewState';
import { type LogConsoleTabId } from '@/log-console/types/LogConsoleTabId';
import { getLogConsoleTransition } from '@/log-console/utils/getLogConsoleTransition';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { WebhookFormMode } from '@/settings/developers/constants/WebhookFormMode';
import { getUiZoom } from '@/ui/theme/utils/getUiZoom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const LogConsoleApiPlayground = lazy(() =>
  import('@/log-console/components/LogConsoleApiPlayground').then((module) => ({
    default: module.LogConsoleApiPlayground,
  })),
);

const LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE =
  '--log-console-detail-panel-width';

const LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS = {
  min: 280,
  max: 800,
  default: 400,
};

const StyledBody = styled.div`
  container-name: log-console-body;
  container-type: inline-size;
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
`;

const StyledActiveTab = styled.div<{ isDetailPanelOpen: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  @container log-console-body (max-width: ${LOG_CONSOLE_NARROW_BODY_MAX_WIDTH}px) {
    visibility: ${({ isDetailPanelOpen }) =>
      isDetailPanelOpen ? 'hidden' : 'visible'};
  }
`;

const StyledDetailPanelWrapper = styled.div<{
  detailPanelWidth: number;
  isOpen: boolean;
  isResizing: boolean;
}>`
  overflow: hidden;
  position: relative;
  transition: ${({ isResizing }) =>
    getLogConsoleTransition(isResizing, ['width'])};
  width: ${({ isOpen, isResizing, detailPanelWidth }) =>
    !isOpen
      ? '0px'
      : isResizing
        ? `var(${LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE}, ${detailPanelWidth}px)`
        : `${detailPanelWidth}px`};

  @container log-console-body (max-width: ${LOG_CONSOLE_NARROW_BODY_MAX_WIDTH}px) {
    position: static;
  }
`;

type LogConsoleBodyProps = {
  tabId: LogConsoleTabId;
};

export const LogConsoleBody = ({ tabId }: LogConsoleBodyProps) => {
  const { t } = useLingui();
  const logConsoleSelectedLog = useAtomStateValue(logConsoleSelectedLogState);
  const logConsoleApisView = useAtomStateValue(logConsoleApisViewState);
  const logConsoleWebhooksView = useAtomStateValue(logConsoleWebhooksViewState);
  const isLogConsoleCliGuideOpen = useAtomStateValue(
    isLogConsoleCliGuideOpenState,
  );
  const [detailPanelWidth, setDetailPanelWidth] = useState(
    LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS.default,
  );
  const [liveDetailPanelWidth, setLiveDetailPanelWidth] = useState<
    number | null
  >(null);
  const [isDetailPanelResizing, setIsDetailPanelResizing] = useState(false);

  const renderContent = () => {
    switch (tabId) {
      case 'logs':
        return <LogConsoleLogs />;
      case 'apis':
        return logConsoleApisView.type === 'playground' ? (
          <Suspense fallback={<SettingsSkeletonLoader />}>
            <LogConsoleApiPlayground
              playgroundType={logConsoleApisView.playgroundType}
              schema={logConsoleApisView.schema}
            />
          </Suspense>
        ) : (
          <LogConsoleApiKeys />
        );
      case 'webhooks':
        return <LogConsoleWebhooks />;
      case 'cli':
        return <LogConsoleCli />;
    }
  };

  const renderDetailPanel = (): ReactNode => {
    switch (tabId) {
      case 'logs':
        return isDefined(logConsoleSelectedLog) ? (
          <LogConsoleDetailPanel />
        ) : null;
      case 'apis':
        switch (logConsoleApisView.type) {
          case 'new':
            return <LogConsoleApiKeyNew />;
          case 'detail':
            return (
              <LogConsoleApiKeyDetail
                key={logConsoleApisView.id}
                apiKeyId={logConsoleApisView.id}
              />
            );
          default:
            return null;
        }
      case 'webhooks':
        switch (logConsoleWebhooksView.type) {
          case 'new':
            return <LogConsoleWebhookForm mode={WebhookFormMode.Create} />;
          case 'detail':
            return (
              <LogConsoleWebhookForm
                key={logConsoleWebhooksView.id}
                mode={WebhookFormMode.Edit}
                webhookId={logConsoleWebhooksView.id}
              />
            );
          default:
            return null;
        }
      case 'cli':
        return isLogConsoleCliGuideOpen ? <LogConsoleCliGetStarted /> : null;
    }
  };

  const detailPanel = renderDetailPanel();
  const isDetailPanelOpen = isDefined(detailPanel);

  if (!isDetailPanelOpen && isDetailPanelResizing) {
    setIsDetailPanelResizing(false);
  }

  const handleDetailPanelWidthPreview = (width: number) => {
    setLiveDetailPanelWidth(width);
    document.documentElement.style.setProperty(
      LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE,
      `${width}px`,
    );
  };

  const handleDetailPanelWidthChange = (width: number) => {
    setLiveDetailPanelWidth(null);
    document.documentElement.style.removeProperty(
      LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE,
    );
    setDetailPanelWidth(
      Math.max(width, LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS.min),
    );
    setIsDetailPanelResizing(false);
  };

  const handleDetailPanelResizeEnd = () => {
    setLiveDetailPanelWidth(null);
    setIsDetailPanelResizing(false);
    document.documentElement.style.removeProperty(
      LOG_CONSOLE_DETAIL_PANEL_CSS_VARIABLE,
    );
  };

  return (
    <StyledBody>
      <StyledActiveTab isDetailPanelOpen={isDetailPanelOpen}>
        {renderContent()}
      </StyledActiveTab>
      <StyledDetailPanelWrapper
        detailPanelWidth={detailPanelWidth}
        isOpen={isDetailPanelOpen}
        isResizing={isDetailPanelResizing}
      >
        {isDetailPanelOpen && (
          <ResizeHandle
            edge="left"
            min={LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS.min}
            max={LOG_CONSOLE_DETAIL_PANEL_WIDTH_CONSTRAINTS.max}
            value={liveDetailPanelWidth ?? detailPanelWidth}
            onValueChange={handleDetailPanelWidthPreview}
            onValueCommitted={handleDetailPanelWidthChange}
            aria-label={t`Resize details`}
            scale={getUiZoom}
            onResizeEnd={handleDetailPanelResizeEnd}
            children={null}
            onResizeStart={() => setIsDetailPanelResizing(true)}
          />
        )}
        {detailPanel}
      </StyledDetailPanelWrapper>
    </StyledBody>
  );
};
