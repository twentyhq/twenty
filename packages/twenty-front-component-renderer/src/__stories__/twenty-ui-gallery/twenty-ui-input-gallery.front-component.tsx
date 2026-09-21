import { defineFrontComponent } from 'twenty-sdk/define';
import {
  IconButton,
  LightButton,
  LightIconButton,
  MainButton,
  TabButton,
} from 'twenty-ui/components';
import { IconPlus, IconSearch, IconStar, IconTrash } from 'twenty-ui/icon';
import { CodeEditorHeader } from 'twenty-ui/components/code-editor';
import {
  Button,
  ButtonGroup,
  ColorPickerButton,
  ColorSchemeCard,
  ColorSchemePicker,
  FloatingButton,
  FloatingButtonGroup,
  IconListViewGrip,
  SearchInput,
  SegmentedControl,
  CardPicker,
  Checkbox,
  Radio,
  RadioGroup,
  Slider,
  Switch,
} from 'twenty-ui/primitives/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

import {
  ComponentGallery,
  type GalleryEntry,
} from '../shared/front-components/component-gallery';

const INPUT_ENTRIES: GalleryEntry[] = [
  {
    name: 'Button',
    node: <Button onClick={() => {}}>{'Button'}</Button>,
  },
  {
    name: 'ButtonGroup',
    node: (
      <ButtonGroup>
        {[<Button key="a">{'A'}</Button>, <Button key="b">{'B'}</Button>]}
      </ButtonGroup>
    ),
  },
  {
    name: 'CardPicker',
    node: (
      <RadioGroup defaultValue="card" aria-label="Card selection">
        <CardPicker value="card">Card</CardPicker>
      </RadioGroup>
    ),
  },
  {
    name: 'Checkbox',
    node: (
      <Checkbox
        aria-label="Checkbox"
        checked={false}
        onCheckedChange={() => {}}
      />
    ),
  },
  {
    name: 'CodeEditorHeader',
    node: <CodeEditorHeader title="Editor" />,
  },
  {
    name: 'ColorPickerButton',
    node: <ColorPickerButton colorName="blue" onClick={() => {}} />,
  },
  {
    name: 'ColorSchemeCard',
    node: <ColorSchemeCard variant="Light" />,
  },
  {
    name: 'ColorSchemePicker',
    node: (
      <ColorSchemePicker
        value="Light"
        onChange={() => {}}
        lightLabel="Light"
        darkLabel="Dark"
        systemLabel="System"
      />
    ),
  },
  {
    name: 'FloatingButton',
    node: <FloatingButton title="Floating" />,
  },
  {
    name: 'FloatingButtonGroup',
    node: (
      <FloatingButtonGroup>
        {[
          <FloatingButton key="a" title="A" />,
          <FloatingButton key="b" title="B" />,
        ]}
      </FloatingButtonGroup>
    ),
  },
  {
    name: 'IconButton (elevated)',
    node: (
      <IconButton elevated size="sm" aria-label="Search">
        <IconSearch />
      </IconButton>
    ),
  },

  {
    name: 'IconButton',
    node: (
      <IconButton aria-label="Add" onClick={() => {}}>
        <IconPlus />
      </IconButton>
    ),
  },
  {
    name: 'ButtonGroup (framed)',
    node: (
      <ButtonGroup framed attached={false} aria-label="Record actions">
        <LightIconButton size="xs" aria-label="Delete" emphasis="subtle">
          <IconTrash />
        </LightIconButton>
      </ButtonGroup>
    ),
  },
  {
    name: 'IconListViewGrip',
    node: <IconListViewGrip />,
  },
  {
    name: 'LightButton',
    node: <LightButton>{'Light'}</LightButton>,
  },
  {
    name: 'LightIconButton',
    node: (
      <LightIconButton aria-label="Star">
        <IconStar />
      </LightIconButton>
    ),
  },
  {
    name: 'MainButton',
    node: <MainButton>{'Main'}</MainButton>,
  },
  {
    name: 'Radio',
    node: (
      <RadioGroup aria-label="Radio example">
        <Radio value="radio">Radio</Radio>
      </RadioGroup>
    ),
  },
  {
    name: 'RadioGroup',
    node: (
      <RadioGroup defaultValue="a" aria-label="Letter">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>
    ),
  },
  {
    name: 'SearchInput',
    node: <SearchInput value="" onChange={() => {}} placeholder="Search" />,
  },
  {
    name: 'SegmentedControl',
    node: (
      <SegmentedControl
        ariaLabel="Choose"
        value="left"
        onChange={() => {}}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ]}
      />
    ),
  },
  {
    name: 'Slider',
    node: (
      <Slider.Root defaultValue={50}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb aria-label="Volume" />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    ),
  },
  {
    name: 'TabButton',
    node: <TabButton>Tab</TabButton>,
  },
  {
    name: 'Switch',
    node: (
      <Switch
        aria-label="Example switch"
        checked={false}
        onCheckedChange={() => {}}
      />
    ),
  },
];

const InputGallery = () => (
  <ThemeProvider colorScheme="light">
    <ComponentGallery
      title="twenty-ui/primitives/input + twenty-ui/components"
      entries={INPUT_ENTRIES}
    />
  </ThemeProvider>
);

export default defineFrontComponent({
  universalIdentifier: 'test-20ui0-0000-0000-0000-000000000107',
  name: 'twenty-ui-input-gallery',
  description:
    'Renders input primitives and shared button presets in the sandbox',
  component: InputGallery,
});
