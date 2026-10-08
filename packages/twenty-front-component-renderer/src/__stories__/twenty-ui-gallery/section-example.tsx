import { createElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

const LONG_DESCRIPTION =
  'Manage workspace preferences, connected accounts, notifications, members, billing, integrations, roles, and permissions for everyone in your workspace.';

export const SectionExample = () => {
  const [activations, setActivations] = useState(0);
  const [focuses, setFocuses] = useState(0);

  return (
    <Section.Root
      render={<section aria-label="Workspace settings" />}
      ref={(element) => {
        if (isDefined(element)) {
          element.dataset.refTag = element.tagName;
        }
      }}
    >
      <Section.Header
        title={<Text render={<span />}>Workspace preferences</Text>}
        description="Manage the settings for your workspace."
        render={(props) =>
          createElement('header', { ...props, title: 'Workspace header' })
        }
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
        actions={
          <>
            <Text>Ready</Text>
            <Button onClick={() => setActivations((count) => count + 1)}>
              Edit workspace
            </Button>
          </>
        }
      />
      <Section.Header
        title="Truncated description"
        level={4}
        size="lg"
        description={LONG_DESCRIPTION}
        descriptionLineClamp={2}
        style={{ maxWidth: 180 }}
      />
      <Section.Header
        title="Focusable description"
        description="Focusable workspace details"
        descriptionLineClamp={1}
        isDescriptionFocusable
        onFocus={() => setFocuses((count) => count + 1)}
      />
      <Section.Header
        title="Full description"
        description={'First line of full details\nSecond line of full details'}
        descriptionLineClamp={false}
        isDescriptionFocusable
      />
      <Section.Header
        title="Rich description"
        description={
          <Text render={<a href="#workspace" />}>Workspace documentation</Text>
        }
      />
      <Text aria-label="Workspace edits">{activations}</Text>
      <Text aria-label="Description focuses">{focuses}</Text>
    </Section.Root>
  );
};
