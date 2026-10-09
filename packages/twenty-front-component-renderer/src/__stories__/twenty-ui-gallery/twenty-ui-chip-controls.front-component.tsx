import { createElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Chip } from 'twenty-ui/primitives/data-display';
import { IconStar } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { ThemeProvider } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { ComponentGallery } from '../shared/front-components/component-gallery';

const ChipControls = () => {
  const [activations, setActivations] = useState(0);
  const [nativeClicks, setNativeClicks] = useState(0);
  const [linkFocuses, setLinkFocuses] = useState(0);
  const [lastKey, setLastKey] = useState('');
  const handleClick = () => setActivations((count) => count + 1);
  return (
    <ThemeProvider colorScheme="light">
      <ComponentGallery
        title="Chip controls"
        entries={[
          {
            name: 'Chip interaction',
            node: (
              <>
                <Chip
                  render={<button type="button" />}
                  onClick={handleClick}
                  onKeyDown={(event) => setLastKey(event.key)}
                  variant="soft"
                  startElement={<IconStar size={14} aria-hidden />}
                  ref={(element) => {
                    element?.setAttribute('data-ref-target', 'chip-button');
                  }}
                >
                  Open chip
                </Chip>
                <Chip
                  render={<button type="button" disabled />}
                  onClick={handleClick}
                >
                  Disabled chip
                </Chip>
                <Chip
                  shape="round"
                  onClick={() => setNativeClicks((count) => count + 1)}
                  data-testid="static-chip"
                  ref={(element) => {
                    element?.setAttribute('data-ref-target', 'chip-div');
                  }}
                >
                  Static chip
                </Chip>
                <Chip
                  render={<button type="button" aria-label="Star record" />}
                  onClick={handleClick}
                >
                  <IconStar size={14} aria-hidden />
                </Chip>
              </>
            ),
          },
          {
            name: 'Chip content',
            node: (
              <>
                <Chip data-testid="empty-chip" />
                <Chip>Unnamed record</Chip>
                <Chip
                  startElement={<Text render={<span />}>Start slot</Text>}
                  endElement={<Text render={<span />}>End slot</Text>}
                  endElementDivider
                >
                  <Text render={<strong />}>Node content</Text>
                </Chip>
              </>
            ),
          },
          {
            name: 'Chip links',
            node: (
              <>
                <Chip
                  render={(renderProps) =>
                    createElement('a', {
                      ...renderProps,
                      href: '#chip-documentation',
                      'data-composed': 'chip-link',
                    })
                  }
                  aria-label="Chip documentation"
                  ref={(element) => {
                    element?.setAttribute('data-ref-target', 'chip-link');
                  }}
                  onFocus={() => setLinkFocuses((count) => count + 1)}
                >
                  https://twenty.com/docs/chip
                </Chip>
                <Chip aria-label="Plain chip URL">https://twenty.com</Chip>
                <Chip>
                  <a href="#chip-content">Caller supplied link</a>
                </Chip>
              </>
            ),
          },
          {
            name: 'Chip truncation',
            node: (
              <>
                <Chip
                  maxWidth={140}
                  tooltipContent={'Caller supplied details\nFull account name'}
                  tooltipDelay={0}
                  tooltipPlace="top"
                  isTooltipMultiline
                >
                  A long account name that truncates inside a chip
                </Chip>
                <Chip truncate={false}>Untruncated chip content</Chip>
              </>
            ),
          },
        ]}
      />
      <output aria-label="Activations">{activations}</output>
      <output aria-label="Native chip clicks">{nativeClicks}</output>
      <output aria-label="Chip link focuses">{linkFocuses}</output>
      <output aria-label="Last chip key">{lastKey}</output>
    </ThemeProvider>
  );
};

export default defineFrontComponent({
  universalIdentifier: '38a631c4-a79b-4033-bf58-5c61d057d42b',
  name: 'twenty-ui-chip-controls',
  description: 'Chip APIs and interactions in the sandbox',
  component: ChipControls,
});
