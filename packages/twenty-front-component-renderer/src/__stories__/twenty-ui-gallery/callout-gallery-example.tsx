import { createElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const CalloutGalleryExample = () => {
  const [dismissRequests, setDismissRequests] = useState(0);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <Callout
        title={<Text render={<span />}>Import needs review</Text>}
        description={
          <Text render={<span />}>
            Review{' '}
            <Button variant="link" href="#records">
              missing records
            </Button>
            .
          </Text>
        }
        icon={<IconAlertTriangle size={16} aria-label="Import warning" />}
        action={
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRetryAttempts((count) => count + 1)}
            >
              Retry callout
            </Button>
            <Button disabled>Unavailable action</Button>
          </>
        }
        status="warning"
        color="blue"
        onDismiss={() => setDismissRequests((count) => count + 1)}
        closeLabel="Request dismissal"
        className="custom-callout"
        style={{ marginTop: 7 }}
        aria-label="Import notice"
        render={<section data-composed="true" />}
        ref={(element) => {
          if (isDefined(element)) element.dataset.refTag = element.tagName;
        }}
      />
      <Text>Dismiss requests: {dismissRequests}</Text>
      <Text>Retry attempts: {retryAttempts}</Text>
      {isVisible && (
        <Callout
          title="Caller-owned notice"
          onDismiss={() => setIsVisible(false)}
          closeLabel="Dismiss controlled notice"
          role="status"
          aria-live="polite"
          aria-label="Controlled notice"
          render={(props, state) =>
            createElement('article', {
              ...props,
              'data-render-status': state.status,
            })
          }
          ref={(element) => {
            if (isDefined(element)) element.dataset.refTag = element.tagName;
          }}
        />
      )}
      <Button onClick={() => setIsVisible(true)}>Show callout</Button>
      <Callout title="Persistent notice" icon={null} />
    </>
  );
};
