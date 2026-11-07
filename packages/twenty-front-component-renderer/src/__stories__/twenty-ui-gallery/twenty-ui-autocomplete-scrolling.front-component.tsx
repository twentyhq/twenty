import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Autocomplete } from 'twenty-ui/primitives/input';
import { DirectionProvider } from 'twenty-ui/primitives/layout';
import { Text } from 'twenty-ui/primitives/typography';

import { TwentyUiGalleryCard } from '@/__stories__/shared/front-components/twenty-ui-gallery-card';
import { LONG_INPUT_VALUES } from '@/__stories__/twenty-ui-gallery/constants/LongInputValues';
import { SCROLLING_OPTION_LABELS } from '@/__stories__/twenty-ui-gallery/constants/ScrollingOptionLabels';

const LONG_INPUT_STYLE = { inlineSize: 160 };

const renderOption = (option: string) => (
  <Autocomplete.Item key={option} value={option}>
    {option}
  </Autocomplete.Item>
);

const AutocompleteScrollingExample = () => {
  const [inlineQuery, setInlineQuery] = useState('');

  return (
    <TwentyUiGalleryCard title="Autocomplete scrolling">
      <Autocomplete.Root items={SCROLLING_OPTION_LABELS} autoHighlight={false}>
        <Autocomplete.Input aria-label="Portal option search" />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.List aria-label="Portal options">
                {renderOption}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
      <div
        role="region"
        aria-label="Owned outer scroller"
        style={{ blockSize: 120, overflowY: 'auto' }}
      >
        <div style={{ blockSize: 80 }} />
        <Autocomplete.Root
          inline
          open
          items={SCROLLING_OPTION_LABELS}
          autoHighlight={false}
          value={inlineQuery}
          onValueChange={setInlineQuery}
        >
          <Autocomplete.Input aria-label="Inline option search" />
          <Autocomplete.List aria-label="Inline options">
            {renderOption}
          </Autocomplete.List>
        </Autocomplete.Root>
      </div>
      <Text role="status" aria-label="Inline query">
        {inlineQuery || 'empty'}
      </Text>
      <Autocomplete.Root
        items={[]}
        defaultValue={LONG_INPUT_VALUES.leftToRight}
      >
        <Autocomplete.Input aria-label="Long value" style={LONG_INPUT_STYLE} />
      </Autocomplete.Root>
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Autocomplete.Root
            items={[]}
            defaultValue={LONG_INPUT_VALUES.rightToLeft}
          >
            <Autocomplete.Input
              aria-label="Long value RTL"
              style={LONG_INPUT_STYLE}
            />
          </Autocomplete.Root>
        </div>
      </DirectionProvider>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: '8c636214-6059-4776-acba-df2488f5b2f0',
  name: 'twenty-ui-autocomplete-scrolling',
  description:
    'Autocomplete option reveal, filtered list reset and long input caret scrolling',
  component: AutocompleteScrollingExample,
});
