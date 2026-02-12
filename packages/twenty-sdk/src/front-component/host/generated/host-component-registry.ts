/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \ \ /\ / / _ \ '_ \| __| | | | Auto-generated file
 *  | |  \ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \_/\_/ \___|_| |_|\__|\__, |
 *                              |___/
 */

import React from 'react';
import {
  RemoteFragmentRenderer,
  createRemoteComponentRenderer,
} from '@remote-dom/react/host';
import { type SerializedEventData } from '../../../sdk/front-component-common/SerializedEventData';
import {
  AnimatedButton,
  AnimatedLightIconButton,
  Button,
  ButtonGroup,
  ColorPickerButton,
  FloatingButton,
  FloatingButtonGroup,
  FloatingIconButton,
  FloatingIconButtonGroup,
  InsideButton,
  LightButton,
  LightIconButton,
  LightIconButtonGroup,
  MainButton,
  RoundedIconButton,
  TabContent,
  TabButton,
  CodeEditor,
  CoreEditorHeader,
  ColorSchemeCard,
  ColorSchemePicker,
  CardPicker,
  Checkbox,
  Radio,
  RadioGroup,
  SearchInput,
  Toggle,
  type AnimatedButtonProps,
  type AnimatedLightIconButtonProps,
  type ButtonProps,
  type ButtonGroupProps,
  type ColorPickerButtonProps,
  type FloatingButtonProps,
  type FloatingButtonGroupProps,
  type FloatingIconButtonProps,
  type FloatingIconButtonGroupProps,
  type InsideButtonProps,
  type LightButtonProps,
  type LightIconButtonProps,
  type LightIconButtonGroupProps,
  type MainButtonProps,
  type RoundedIconButtonProps,
  type TabContentProps,
  type TabButtonProps,
  type CodeEditorProps,
  type CoreEditorHeaderProps,
  type ColorSchemeCardProps,
  type ColorSchemePickerProps,
  type CardPickerProps,
  type CheckboxProps,
  type RadioProps,
  type RadioGroupProps,
  type SearchInputProps,
  type ToggleProps,
} from 'twenty-ui/input';
import {
  AvatarChip,
  MultipleAvatarChip,
  Chip,
  LinkChip,
  Pill,
  Tag,
  type AvatarChipProps,
  type MultipleAvatarChipProps,
  type ChipProps,
  type LinkChipProps,
  type PillProps,
  type TagProps,
} from 'twenty-ui/components';
import {
  Avatar,
  AvatarGroup,
  Banner,
  SidePanelInformationBanner,
  Callout,
  AnimatedCheckmark,
  Checkmark,
  ColorSample,
  CommandBlock,
  Icon,
  Info,
  Status,
  HorizontalSeparator,
  AppTooltip,
  OverflowingTextWithTooltip,
  H1Title,
  H2Title,
  H3Title,
  type AvatarProps,
  type AvatarGroupProps,
  type BannerProps,
  type SidePanelInformationBannerProps,
  type CalloutProps,
  type AnimatedCheckmarkProps,
  type CheckmarkProps,
  type ColorSampleProps,
  type CommandBlockProps,
  type IconProps,
  type InfoProps,
  type StatusProps,
  type HorizontalSeparatorProps,
  type AppTooltipProps,
  type OverflowingTextWithTooltipProps,
  type H1TitleProps,
  type H2TitleProps,
  type H3TitleProps,
} from 'twenty-ui/display';
import {
  Loader,
  CircularProgressBar,
  ProgressBar,
  type LoaderProps,
  type CircularProgressBarProps,
  type ProgressBarProps,
} from 'twenty-ui/feedback';
import {
  AnimatedExpandableContainer,
  AnimatedPlaceholder,
  Section,
  type AnimatedExpandableContainerProps,
  type AnimatedPlaceholderProps,
  type SectionProps,
} from 'twenty-ui/layout';
import {
  AdvancedSettingsToggle,
  ClickToActionLink,
  ContactLink,
  GithubVersionLink,
  RawLink,
  RoundedLink,
  SocialLink,
  UndecoratedLink,
  MenuPicker,
  MenuItem,
  MenuItemAvatar,
  MenuItemDraggable,
  MenuItemHotKeys,
  MenuItemMultiSelect,
  MenuItemMultiSelectAvatar,
  MenuItemMultiSelectTag,
  MenuItemNavigate,
  MenuItemSelect,
  MenuItemSelectAvatar,
  MenuItemSelectColor,
  MenuItemSelectTag,
  MenuItemSuggestion,
  MenuItemToggle,
  MenuItemLeftContent,
  NavigationBar,
  NavigationBarItem,
  NotificationCounter,
  type AdvancedSettingsToggleProps,
  type ClickToActionLinkProps,
  type ContactLinkProps,
  type GithubVersionLinkProps,
  type RawLinkProps,
  type RoundedLinkProps,
  type SocialLinkProps,
  type UndecoratedLinkProps,
  type MenuPickerProps,
  type MenuItemProps,
  type MenuItemAvatarProps,
  type MenuItemDraggableProps,
  type MenuItemHotKeysProps,
  type MenuItemMultiSelectProps,
  type MenuItemMultiSelectAvatarProps,
  type MenuItemMultiSelectTagProps,
  type MenuItemNavigateProps,
  type MenuItemSelectProps,
  type MenuItemSelectAvatarProps,
  type MenuItemSelectColorProps,
  type MenuItemSelectTagProps,
  type MenuItemSuggestionProps,
  type MenuItemToggleProps,
  type MenuItemLeftContentProps,
  type NavigationBarProps,
  type NavigationBarItemProps,
  type NotificationCounterProps,
} from 'twenty-ui/navigation';
const INTERNAL_PROPS = new Set(['element', 'receiver', 'components']);

const EVENT_NAME_MAP: Record<string, string> = {
  onclick: 'onClick',
  ondblclick: 'onDoubleClick',
  onmousedown: 'onMouseDown',
  onmouseup: 'onMouseUp',
  onmouseover: 'onMouseOver',
  onmouseout: 'onMouseOut',
  onmouseenter: 'onMouseEnter',
  onmouseleave: 'onMouseLeave',
  onkeydown: 'onKeyDown',
  onkeyup: 'onKeyUp',
  onkeypress: 'onKeyPress',
  onfocus: 'onFocus',
  onblur: 'onBlur',
  onchange: 'onChange',
  oninput: 'onInput',
  onsubmit: 'onSubmit',
  onscroll: 'onScroll',
  onwheel: 'onWheel',
  oncontextmenu: 'onContextMenu',
  ondrag: 'onDrag',
};

const parseStyle = (
  styleString: string | undefined,
): React.CSSProperties | undefined => {
  if (!styleString || typeof styleString !== 'string') {
    return styleString as React.CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    style[camelProperty] = value;
  }

  return style;
};

const serializeEvent = (event: unknown): SerializedEventData => {
  if (!event || typeof event !== 'object') {
    return { type: 'unknown' };
  }

  const domEvent = event as Record<string, unknown>;
  const serialized: SerializedEventData = {
    type: typeof domEvent.type === 'string' ? domEvent.type : 'unknown',
  };

  if ('altKey' in domEvent) serialized.altKey = domEvent.altKey as boolean;
  if ('ctrlKey' in domEvent) serialized.ctrlKey = domEvent.ctrlKey as boolean;
  if ('metaKey' in domEvent) serialized.metaKey = domEvent.metaKey as boolean;
  if ('shiftKey' in domEvent)
    serialized.shiftKey = domEvent.shiftKey as boolean;

  if ('clientX' in domEvent) serialized.clientX = domEvent.clientX as number;
  if ('clientY' in domEvent) serialized.clientY = domEvent.clientY as number;
  if ('pageX' in domEvent) serialized.pageX = domEvent.pageX as number;
  if ('pageY' in domEvent) serialized.pageY = domEvent.pageY as number;
  if ('screenX' in domEvent) serialized.screenX = domEvent.screenX as number;
  if ('screenY' in domEvent) serialized.screenY = domEvent.screenY as number;
  if ('button' in domEvent) serialized.button = domEvent.button as number;
  if ('buttons' in domEvent) serialized.buttons = domEvent.buttons as number;

  if ('key' in domEvent) serialized.key = domEvent.key as string;
  if ('code' in domEvent) serialized.code = domEvent.code as string;
  if ('repeat' in domEvent) serialized.repeat = domEvent.repeat as boolean;

  if ('deltaX' in domEvent) serialized.deltaX = domEvent.deltaX as number;
  if ('deltaY' in domEvent) serialized.deltaY = domEvent.deltaY as number;
  if ('deltaZ' in domEvent) serialized.deltaZ = domEvent.deltaZ as number;
  if ('deltaMode' in domEvent)
    serialized.deltaMode = domEvent.deltaMode as number;

  const target = domEvent.target as Record<string, unknown> | undefined;
  if (target && typeof target === 'object') {
    if ('value' in target && typeof target.value === 'string') {
      serialized.value = target.value;
    }
    if ('checked' in target && typeof target.checked === 'boolean') {
      serialized.checked = target.checked;
    }
    if ('scrollTop' in target && typeof target.scrollTop === 'number') {
      serialized.scrollTop = target.scrollTop;
    }
    if ('scrollLeft' in target && typeof target.scrollLeft === 'number') {
      serialized.scrollLeft = target.scrollLeft;
    }
  }

  return serialized;
};

const wrapEventHandler = (handler: (detail: SerializedEventData) => void) => {
  return (event: unknown) => {
    handler(serializeEvent(event));
  };
};

const filterHtmlProps = <T extends object>(props: T): T => {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || value === undefined) continue;

    if (key === 'style') {
      filtered.style = parseStyle(value as string | undefined);
    } else {
      const normalizedKey = EVENT_NAME_MAP[key.toLowerCase()] || key;
      if (normalizedKey.startsWith('on') && typeof value === 'function') {
        filtered[normalizedKey] = wrapEventHandler(
          value as (detail: SerializedEventData) => void,
        );
      } else {
        filtered[normalizedKey] = value;
      }
    }
  }
  return filtered as T;
};

const filterUiProps = <T extends object>(
  props: T,
  eventPropNames?: Set<string>,
): T => {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (INTERNAL_PROPS.has(key) || value === undefined) continue;

    if (key === 'style') {
      filtered.style = parseStyle(value as string | undefined);
    } else if (eventPropNames?.has(key) && typeof value === 'function') {
      filtered[key] = wrapEventHandler(
        value as (detail: SerializedEventData) => void,
      );
    } else {
      filtered[key] = value;
    }
  }
  return filtered as T;
};
const HtmlDivWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'div',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlSpanWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'span',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlSectionWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'section',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlArticleWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'article',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlHeaderWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'header',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlFooterWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'footer',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlMainWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'main',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlNavWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'nav',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlAsideWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'aside',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlPWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement('p', { ...filterHtmlProps(props), ref }, children);
});
const HtmlH1Wrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'h1',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlH2Wrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'h2',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlH3Wrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'h3',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlH4Wrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'h4',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlH5Wrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'h5',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlH6Wrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'h6',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlStrongWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'strong',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlEmWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'em',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlSmallWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'small',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlCodeWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'code',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlPreWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'pre',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlBlockquoteWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'blockquote',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlAWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement('a', { ...filterHtmlProps(props), ref }, children);
});
const HtmlImgWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children: _children, ...props }, ref) => {
  return React.createElement('img', { ...filterHtmlProps(props), ref });
});
const HtmlUlWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'ul',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlOlWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'ol',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlLiWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'li',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlFormWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'form',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlLabelWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'label',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlInputWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children: _children, ...props }, ref) => {
  return React.createElement('input', { ...filterHtmlProps(props), ref });
});
const HtmlTextareaWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'textarea',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlSelectWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'select',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlOptionWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'option',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlButtonWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'button',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlTableWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'table',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlTheadWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'thead',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlTbodyWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'tbody',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlTfootWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'tfoot',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlTrWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'tr',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlThWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'th',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlTdWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children, ...props }, ref) => {
  return React.createElement(
    'td',
    { ...filterHtmlProps(props), ref },
    children,
  );
});
const HtmlBrWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children: _children, ...props }, ref) => {
  return React.createElement('br', { ...filterHtmlProps(props), ref });
});
const HtmlHrWrapper = React.forwardRef<
  HTMLElement,
  { children?: React.ReactNode } & Record<string, unknown>
>(({ children: _children, ...props }, ref) => {
  return React.createElement('hr', { ...filterHtmlProps(props), ref });
});
const TwentyUiAnimatedButtonWrapper = (
  props: AnimatedButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    AnimatedButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiAnimatedLightIconButtonWrapper = (
  props: AnimatedLightIconButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    AnimatedLightIconButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiButtonWrapper = (
  props: ButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    Button,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiButtonGroupWrapper = (
  props: ButtonGroupProps & { children?: React.ReactNode },
) => {
  return React.createElement(ButtonGroup, filterUiProps(props));
};
const TwentyUiColorPickerButtonWrapper = (
  props: ColorPickerButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    ColorPickerButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiFloatingButtonWrapper = (
  props: FloatingButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(FloatingButton, filterUiProps(props));
};
const TwentyUiFloatingButtonGroupWrapper = (
  props: FloatingButtonGroupProps & { children?: React.ReactNode },
) => {
  return React.createElement(FloatingButtonGroup, filterUiProps(props));
};
const TwentyUiFloatingIconButtonWrapper = (
  props: FloatingIconButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    FloatingIconButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiFloatingIconButtonGroupWrapper = (
  props: FloatingIconButtonGroupProps & { children?: React.ReactNode },
) => {
  return React.createElement(FloatingIconButtonGroup, filterUiProps(props));
};
const TwentyUiInsideButtonWrapper = (
  props: InsideButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    InsideButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiLightButtonWrapper = (
  props: LightButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    LightButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiLightIconButtonWrapper = (
  props: LightIconButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    LightIconButton,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiLightIconButtonGroupWrapper = (
  props: LightIconButtonGroupProps & { children?: React.ReactNode },
) => {
  return React.createElement(LightIconButtonGroup, filterUiProps(props));
};
const TwentyUiMainButtonWrapper = (
  props: MainButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(MainButton, filterUiProps(props));
};
const TwentyUiRoundedIconButtonWrapper = (
  props: RoundedIconButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(RoundedIconButton, filterUiProps(props));
};
const TwentyUiTabContentWrapper = (
  props: TabContentProps & { children?: React.ReactNode },
) => {
  return React.createElement(TabContent, filterUiProps(props));
};
const TwentyUiTabButtonWrapper = (
  props: TabButtonProps & { children?: React.ReactNode },
) => {
  return React.createElement(TabButton, filterUiProps(props));
};
const TwentyUiCodeEditorWrapper = (
  props: CodeEditorProps & { children?: React.ReactNode },
) => {
  return React.createElement(CodeEditor, filterUiProps(props));
};
const TwentyUiCoreEditorHeaderWrapper = (
  props: CoreEditorHeaderProps & { children?: React.ReactNode },
) => {
  return React.createElement(CoreEditorHeader, filterUiProps(props));
};
const TwentyUiColorSchemeCardWrapper = (
  props: ColorSchemeCardProps & { children?: React.ReactNode },
) => {
  return React.createElement(ColorSchemeCard, filterUiProps(props));
};
const TwentyUiColorSchemePickerWrapper = (
  props: ColorSchemePickerProps & { children?: React.ReactNode },
) => {
  return React.createElement(ColorSchemePicker, filterUiProps(props));
};
const TwentyUiCardPickerWrapper = (
  props: CardPickerProps & { children?: React.ReactNode },
) => {
  return React.createElement(CardPicker, filterUiProps(props));
};
const TwentyUiCheckboxWrapper = (
  props: CheckboxProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    Checkbox,
    filterUiProps(props, new Set(['onChange'])),
  );
};
const TwentyUiRadioWrapper = (
  props: RadioProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    Radio,
    filterUiProps(props, new Set(['onChange'])),
  );
};
const TwentyUiRadioGroupWrapper = (
  props: RadioGroupProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    RadioGroup,
    filterUiProps(props, new Set(['onChange'])),
  );
};
const TwentyUiSearchInputWrapper = (
  props: SearchInputProps & { children?: React.ReactNode },
) => {
  return React.createElement(SearchInput, filterUiProps(props));
};
const TwentyUiToggleWrapper = (
  props: ToggleProps & { children?: React.ReactNode },
) => {
  return React.createElement(Toggle, filterUiProps(props));
};
const TwentyUiAvatarChipWrapper = (
  props: AvatarChipProps & { children?: React.ReactNode },
) => {
  return React.createElement(AvatarChip, filterUiProps(props));
};
const TwentyUiMultipleAvatarChipWrapper = (
  props: MultipleAvatarChipProps & { children?: React.ReactNode },
) => {
  return React.createElement(MultipleAvatarChip, filterUiProps(props));
};
const TwentyUiChipWrapper = (
  props: ChipProps & { children?: React.ReactNode },
) => {
  return React.createElement(Chip, filterUiProps(props));
};
const TwentyUiLinkChipWrapper = (
  props: LinkChipProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    LinkChip,
    filterUiProps(props, new Set(['onClick', 'onMouseDown'])),
  );
};
const TwentyUiPillWrapper = (
  props: PillProps & { children?: React.ReactNode },
) => {
  return React.createElement(Pill, filterUiProps(props));
};
const TwentyUiTagWrapper = (
  props: TagProps & { children?: React.ReactNode },
) => {
  return React.createElement(Tag, filterUiProps(props));
};
const TwentyUiAvatarWrapper = (
  props: AvatarProps & { children?: React.ReactNode },
) => {
  return React.createElement(Avatar, filterUiProps(props));
};
const TwentyUiAvatarGroupWrapper = (
  props: AvatarGroupProps & { children?: React.ReactNode },
) => {
  return React.createElement(AvatarGroup, filterUiProps(props));
};
const TwentyUiBannerWrapper = (
  props: BannerProps & { children?: React.ReactNode },
) => {
  return React.createElement(Banner, filterUiProps(props));
};
const TwentyUiSidePanelInformationBannerWrapper = (
  props: SidePanelInformationBannerProps & { children?: React.ReactNode },
) => {
  return React.createElement(SidePanelInformationBanner, filterUiProps(props));
};
const TwentyUiCalloutWrapper = (
  props: CalloutProps & { children?: React.ReactNode },
) => {
  return React.createElement(Callout, filterUiProps(props));
};
const TwentyUiAnimatedCheckmarkWrapper = (
  props: AnimatedCheckmarkProps & { children?: React.ReactNode },
) => {
  return React.createElement(AnimatedCheckmark, filterUiProps(props));
};
const TwentyUiCheckmarkWrapper = (
  props: CheckmarkProps & { children?: React.ReactNode },
) => {
  return React.createElement(Checkmark, filterUiProps(props));
};
const TwentyUiColorSampleWrapper = React.forwardRef<
  unknown,
  ColorSampleProps & { children?: React.ReactNode }
>((props, ref) => {
  return React.createElement(ColorSample as React.ElementType, {
    ...filterUiProps(props),
    ref,
  });
});
const TwentyUiCommandBlockWrapper = (
  props: CommandBlockProps & { children?: React.ReactNode },
) => {
  return React.createElement(CommandBlock, filterUiProps(props));
};
const TwentyUiIconWrapper = (
  props: IconProps & { children?: React.ReactNode },
) => {
  return React.createElement(Icon, filterUiProps(props));
};
const TwentyUiInfoWrapper = (
  props: InfoProps & { children?: React.ReactNode },
) => {
  return React.createElement(Info, filterUiProps(props, new Set(['onClick'])));
};
const TwentyUiStatusWrapper = (
  props: StatusProps & { children?: React.ReactNode },
) => {
  return React.createElement(Status, filterUiProps(props));
};
const TwentyUiHorizontalSeparatorWrapper = (
  props: HorizontalSeparatorProps & { children?: React.ReactNode },
) => {
  return React.createElement(HorizontalSeparator, filterUiProps(props));
};
const TwentyUiAppTooltipWrapper = (
  props: AppTooltipProps & { children?: React.ReactNode },
) => {
  return React.createElement(AppTooltip, filterUiProps(props));
};
const TwentyUiOverflowingTextWithTooltipWrapper = (
  props: OverflowingTextWithTooltipProps & { children?: React.ReactNode },
) => {
  return React.createElement(OverflowingTextWithTooltip, filterUiProps(props));
};
const TwentyUiH1TitleWrapper = (
  props: H1TitleProps & { children?: React.ReactNode },
) => {
  return React.createElement(H1Title, filterUiProps(props));
};
const TwentyUiH2TitleWrapper = (
  props: H2TitleProps & { children?: React.ReactNode },
) => {
  return React.createElement(H2Title, filterUiProps(props));
};
const TwentyUiH3TitleWrapper = (
  props: H3TitleProps & { children?: React.ReactNode },
) => {
  return React.createElement(H3Title, filterUiProps(props));
};
const TwentyUiLoaderWrapper = (
  props: LoaderProps & { children?: React.ReactNode },
) => {
  return React.createElement(Loader, filterUiProps(props));
};
const TwentyUiCircularProgressBarWrapper = (
  props: CircularProgressBarProps & { children?: React.ReactNode },
) => {
  return React.createElement(CircularProgressBar, filterUiProps(props));
};
const TwentyUiProgressBarWrapper = (
  props: ProgressBarProps & { children?: React.ReactNode },
) => {
  return React.createElement(ProgressBar, filterUiProps(props));
};
const TwentyUiAnimatedExpandableContainerWrapper = (
  props: AnimatedExpandableContainerProps & { children?: React.ReactNode },
) => {
  return React.createElement(AnimatedExpandableContainer, filterUiProps(props));
};
const TwentyUiAnimatedPlaceholderWrapper = (
  props: AnimatedPlaceholderProps & { children?: React.ReactNode },
) => {
  return React.createElement(AnimatedPlaceholder, filterUiProps(props));
};
const TwentyUiSectionWrapper = (
  props: SectionProps & { children?: React.ReactNode },
) => {
  return React.createElement(Section, filterUiProps(props));
};
const TwentyUiAdvancedSettingsToggleWrapper = (
  props: AdvancedSettingsToggleProps & { children?: React.ReactNode },
) => {
  return React.createElement(AdvancedSettingsToggle, filterUiProps(props));
};
const TwentyUiClickToActionLinkWrapper = (
  props: ClickToActionLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(ClickToActionLink, filterUiProps(props));
};
const TwentyUiContactLinkWrapper = (
  props: ContactLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    ContactLink,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiGithubVersionLinkWrapper = (
  props: GithubVersionLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(GithubVersionLink, filterUiProps(props));
};
const TwentyUiRawLinkWrapper = (
  props: RawLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    RawLink,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiRoundedLinkWrapper = (
  props: RoundedLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    RoundedLink,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiSocialLinkWrapper = (
  props: SocialLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    SocialLink,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiUndecoratedLinkWrapper = (
  props: UndecoratedLinkProps & { children?: React.ReactNode },
) => {
  return React.createElement(UndecoratedLink, filterUiProps(props));
};
const TwentyUiMenuPickerWrapper = (
  props: MenuPickerProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuPicker, filterUiProps(props));
};
const TwentyUiMenuItemWrapper = (
  props: MenuItemProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    MenuItem,
    filterUiProps(props, new Set(['onClick', 'onMouseEnter', 'onMouseLeave'])),
  );
};
const TwentyUiMenuItemAvatarWrapper = (
  props: MenuItemAvatarProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    MenuItemAvatar,
    filterUiProps(props, new Set(['onClick', 'onMouseEnter', 'onMouseLeave'])),
  );
};
const TwentyUiMenuItemDraggableWrapper = (
  props: MenuItemDraggableProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemDraggable, filterUiProps(props));
};
const TwentyUiMenuItemHotKeysWrapper = (
  props: MenuItemHotKeysProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemHotKeys, filterUiProps(props));
};
const TwentyUiMenuItemMultiSelectWrapper = (
  props: MenuItemMultiSelectProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemMultiSelect, filterUiProps(props));
};
const TwentyUiMenuItemMultiSelectAvatarWrapper = (
  props: MenuItemMultiSelectAvatarProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemMultiSelectAvatar, filterUiProps(props));
};
const TwentyUiMenuItemMultiSelectTagWrapper = (
  props: MenuItemMultiSelectTagProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemMultiSelectTag, filterUiProps(props));
};
const TwentyUiMenuItemNavigateWrapper = (
  props: MenuItemNavigateProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemNavigate, filterUiProps(props));
};
const TwentyUiMenuItemSelectWrapper = (
  props: MenuItemSelectProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemSelect, filterUiProps(props));
};
const TwentyUiMenuItemSelectAvatarWrapper = (
  props: MenuItemSelectAvatarProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemSelectAvatar, filterUiProps(props));
};
const TwentyUiMenuItemSelectColorWrapper = (
  props: MenuItemSelectColorProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemSelectColor, filterUiProps(props));
};
const TwentyUiMenuItemSelectTagWrapper = (
  props: MenuItemSelectTagProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemSelectTag, filterUiProps(props));
};
const TwentyUiMenuItemSuggestionWrapper = (
  props: MenuItemSuggestionProps & { children?: React.ReactNode },
) => {
  return React.createElement(
    MenuItemSuggestion,
    filterUiProps(props, new Set(['onClick'])),
  );
};
const TwentyUiMenuItemToggleWrapper = (
  props: MenuItemToggleProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemToggle, filterUiProps(props));
};
const TwentyUiMenuItemLeftContentWrapper = (
  props: MenuItemLeftContentProps & { children?: React.ReactNode },
) => {
  return React.createElement(MenuItemLeftContent, filterUiProps(props));
};
const TwentyUiNavigationBarWrapper = (
  props: NavigationBarProps & { children?: React.ReactNode },
) => {
  return React.createElement(NavigationBar, filterUiProps(props));
};
const TwentyUiNavigationBarItemWrapper = (
  props: NavigationBarItemProps & { children?: React.ReactNode },
) => {
  return React.createElement(NavigationBarItem, filterUiProps(props));
};
const TwentyUiNotificationCounterWrapper = (
  props: NotificationCounterProps & { children?: React.ReactNode },
) => {
  return React.createElement(NotificationCounter, filterUiProps(props));
};
type ComponentRegistryValue =
  | ReturnType<typeof createRemoteComponentRenderer>
  | typeof RemoteFragmentRenderer;

export const componentRegistry: Map<string, ComponentRegistryValue> = new Map([
  ['html-div', createRemoteComponentRenderer(HtmlDivWrapper)],
  ['html-span', createRemoteComponentRenderer(HtmlSpanWrapper)],
  ['html-section', createRemoteComponentRenderer(HtmlSectionWrapper)],
  ['html-article', createRemoteComponentRenderer(HtmlArticleWrapper)],
  ['html-header', createRemoteComponentRenderer(HtmlHeaderWrapper)],
  ['html-footer', createRemoteComponentRenderer(HtmlFooterWrapper)],
  ['html-main', createRemoteComponentRenderer(HtmlMainWrapper)],
  ['html-nav', createRemoteComponentRenderer(HtmlNavWrapper)],
  ['html-aside', createRemoteComponentRenderer(HtmlAsideWrapper)],
  ['html-p', createRemoteComponentRenderer(HtmlPWrapper)],
  ['html-h1', createRemoteComponentRenderer(HtmlH1Wrapper)],
  ['html-h2', createRemoteComponentRenderer(HtmlH2Wrapper)],
  ['html-h3', createRemoteComponentRenderer(HtmlH3Wrapper)],
  ['html-h4', createRemoteComponentRenderer(HtmlH4Wrapper)],
  ['html-h5', createRemoteComponentRenderer(HtmlH5Wrapper)],
  ['html-h6', createRemoteComponentRenderer(HtmlH6Wrapper)],
  ['html-strong', createRemoteComponentRenderer(HtmlStrongWrapper)],
  ['html-em', createRemoteComponentRenderer(HtmlEmWrapper)],
  ['html-small', createRemoteComponentRenderer(HtmlSmallWrapper)],
  ['html-code', createRemoteComponentRenderer(HtmlCodeWrapper)],
  ['html-pre', createRemoteComponentRenderer(HtmlPreWrapper)],
  ['html-blockquote', createRemoteComponentRenderer(HtmlBlockquoteWrapper)],
  ['html-a', createRemoteComponentRenderer(HtmlAWrapper)],
  ['html-img', createRemoteComponentRenderer(HtmlImgWrapper)],
  ['html-ul', createRemoteComponentRenderer(HtmlUlWrapper)],
  ['html-ol', createRemoteComponentRenderer(HtmlOlWrapper)],
  ['html-li', createRemoteComponentRenderer(HtmlLiWrapper)],
  ['html-form', createRemoteComponentRenderer(HtmlFormWrapper)],
  ['html-label', createRemoteComponentRenderer(HtmlLabelWrapper)],
  ['html-input', createRemoteComponentRenderer(HtmlInputWrapper)],
  ['html-textarea', createRemoteComponentRenderer(HtmlTextareaWrapper)],
  ['html-select', createRemoteComponentRenderer(HtmlSelectWrapper)],
  ['html-option', createRemoteComponentRenderer(HtmlOptionWrapper)],
  ['html-button', createRemoteComponentRenderer(HtmlButtonWrapper)],
  ['html-table', createRemoteComponentRenderer(HtmlTableWrapper)],
  ['html-thead', createRemoteComponentRenderer(HtmlTheadWrapper)],
  ['html-tbody', createRemoteComponentRenderer(HtmlTbodyWrapper)],
  ['html-tfoot', createRemoteComponentRenderer(HtmlTfootWrapper)],
  ['html-tr', createRemoteComponentRenderer(HtmlTrWrapper)],
  ['html-th', createRemoteComponentRenderer(HtmlThWrapper)],
  ['html-td', createRemoteComponentRenderer(HtmlTdWrapper)],
  ['html-br', createRemoteComponentRenderer(HtmlBrWrapper)],
  ['html-hr', createRemoteComponentRenderer(HtmlHrWrapper)],
  [
    'twenty-ui-animated-button',
    createRemoteComponentRenderer(TwentyUiAnimatedButtonWrapper),
  ],
  [
    'twenty-ui-animated-light-icon-button',
    createRemoteComponentRenderer(TwentyUiAnimatedLightIconButtonWrapper),
  ],
  ['twenty-ui-button', createRemoteComponentRenderer(TwentyUiButtonWrapper)],
  [
    'twenty-ui-button-group',
    createRemoteComponentRenderer(TwentyUiButtonGroupWrapper),
  ],
  [
    'twenty-ui-color-picker-button',
    createRemoteComponentRenderer(TwentyUiColorPickerButtonWrapper),
  ],
  [
    'twenty-ui-floating-button',
    createRemoteComponentRenderer(TwentyUiFloatingButtonWrapper),
  ],
  [
    'twenty-ui-floating-button-group',
    createRemoteComponentRenderer(TwentyUiFloatingButtonGroupWrapper),
  ],
  [
    'twenty-ui-floating-icon-button',
    createRemoteComponentRenderer(TwentyUiFloatingIconButtonWrapper),
  ],
  [
    'twenty-ui-floating-icon-button-group',
    createRemoteComponentRenderer(TwentyUiFloatingIconButtonGroupWrapper),
  ],
  [
    'twenty-ui-inside-button',
    createRemoteComponentRenderer(TwentyUiInsideButtonWrapper),
  ],
  [
    'twenty-ui-light-button',
    createRemoteComponentRenderer(TwentyUiLightButtonWrapper),
  ],
  [
    'twenty-ui-light-icon-button',
    createRemoteComponentRenderer(TwentyUiLightIconButtonWrapper),
  ],
  [
    'twenty-ui-light-icon-button-group',
    createRemoteComponentRenderer(TwentyUiLightIconButtonGroupWrapper),
  ],
  [
    'twenty-ui-main-button',
    createRemoteComponentRenderer(TwentyUiMainButtonWrapper),
  ],
  [
    'twenty-ui-rounded-icon-button',
    createRemoteComponentRenderer(TwentyUiRoundedIconButtonWrapper),
  ],
  [
    'twenty-ui-tab-content',
    createRemoteComponentRenderer(TwentyUiTabContentWrapper),
  ],
  [
    'twenty-ui-tab-button',
    createRemoteComponentRenderer(TwentyUiTabButtonWrapper),
  ],
  [
    'twenty-ui-code-editor',
    createRemoteComponentRenderer(TwentyUiCodeEditorWrapper),
  ],
  [
    'twenty-ui-core-editor-header',
    createRemoteComponentRenderer(TwentyUiCoreEditorHeaderWrapper),
  ],
  [
    'twenty-ui-color-scheme-card',
    createRemoteComponentRenderer(TwentyUiColorSchemeCardWrapper),
  ],
  [
    'twenty-ui-color-scheme-picker',
    createRemoteComponentRenderer(TwentyUiColorSchemePickerWrapper),
  ],
  [
    'twenty-ui-card-picker',
    createRemoteComponentRenderer(TwentyUiCardPickerWrapper),
  ],
  [
    'twenty-ui-checkbox',
    createRemoteComponentRenderer(TwentyUiCheckboxWrapper),
  ],
  ['twenty-ui-radio', createRemoteComponentRenderer(TwentyUiRadioWrapper)],
  [
    'twenty-ui-radio-group',
    createRemoteComponentRenderer(TwentyUiRadioGroupWrapper),
  ],
  [
    'twenty-ui-search-input',
    createRemoteComponentRenderer(TwentyUiSearchInputWrapper),
  ],
  ['twenty-ui-toggle', createRemoteComponentRenderer(TwentyUiToggleWrapper)],
  [
    'twenty-ui-avatar-chip',
    createRemoteComponentRenderer(TwentyUiAvatarChipWrapper),
  ],
  [
    'twenty-ui-multiple-avatar-chip',
    createRemoteComponentRenderer(TwentyUiMultipleAvatarChipWrapper),
  ],
  ['twenty-ui-chip', createRemoteComponentRenderer(TwentyUiChipWrapper)],
  [
    'twenty-ui-link-chip',
    createRemoteComponentRenderer(TwentyUiLinkChipWrapper),
  ],
  ['twenty-ui-pill', createRemoteComponentRenderer(TwentyUiPillWrapper)],
  ['twenty-ui-tag', createRemoteComponentRenderer(TwentyUiTagWrapper)],
  ['twenty-ui-avatar', createRemoteComponentRenderer(TwentyUiAvatarWrapper)],
  [
    'twenty-ui-avatar-group',
    createRemoteComponentRenderer(TwentyUiAvatarGroupWrapper),
  ],
  ['twenty-ui-banner', createRemoteComponentRenderer(TwentyUiBannerWrapper)],
  [
    'twenty-ui-side-panel-information-banner',
    createRemoteComponentRenderer(TwentyUiSidePanelInformationBannerWrapper),
  ],
  ['twenty-ui-callout', createRemoteComponentRenderer(TwentyUiCalloutWrapper)],
  [
    'twenty-ui-animated-checkmark',
    createRemoteComponentRenderer(TwentyUiAnimatedCheckmarkWrapper),
  ],
  [
    'twenty-ui-checkmark',
    createRemoteComponentRenderer(TwentyUiCheckmarkWrapper),
  ],
  [
    'twenty-ui-color-sample',
    createRemoteComponentRenderer(TwentyUiColorSampleWrapper),
  ],
  [
    'twenty-ui-command-block',
    createRemoteComponentRenderer(TwentyUiCommandBlockWrapper),
  ],
  ['twenty-ui-icon', createRemoteComponentRenderer(TwentyUiIconWrapper)],
  ['twenty-ui-info', createRemoteComponentRenderer(TwentyUiInfoWrapper)],
  ['twenty-ui-status', createRemoteComponentRenderer(TwentyUiStatusWrapper)],
  [
    'twenty-ui-horizontal-separator',
    createRemoteComponentRenderer(TwentyUiHorizontalSeparatorWrapper),
  ],
  [
    'twenty-ui-app-tooltip',
    createRemoteComponentRenderer(TwentyUiAppTooltipWrapper),
  ],
  [
    'twenty-ui-overflowing-text-with-tooltip',
    createRemoteComponentRenderer(TwentyUiOverflowingTextWithTooltipWrapper),
  ],
  ['twenty-ui-h1-title', createRemoteComponentRenderer(TwentyUiH1TitleWrapper)],
  ['twenty-ui-h2-title', createRemoteComponentRenderer(TwentyUiH2TitleWrapper)],
  ['twenty-ui-h3-title', createRemoteComponentRenderer(TwentyUiH3TitleWrapper)],
  ['twenty-ui-loader', createRemoteComponentRenderer(TwentyUiLoaderWrapper)],
  [
    'twenty-ui-circular-progress-bar',
    createRemoteComponentRenderer(TwentyUiCircularProgressBarWrapper),
  ],
  [
    'twenty-ui-progress-bar',
    createRemoteComponentRenderer(TwentyUiProgressBarWrapper),
  ],
  [
    'twenty-ui-animated-expandable-container',
    createRemoteComponentRenderer(TwentyUiAnimatedExpandableContainerWrapper),
  ],
  [
    'twenty-ui-animated-placeholder',
    createRemoteComponentRenderer(TwentyUiAnimatedPlaceholderWrapper),
  ],
  ['twenty-ui-section', createRemoteComponentRenderer(TwentyUiSectionWrapper)],
  [
    'twenty-ui-advanced-settings-toggle',
    createRemoteComponentRenderer(TwentyUiAdvancedSettingsToggleWrapper),
  ],
  [
    'twenty-ui-click-to-action-link',
    createRemoteComponentRenderer(TwentyUiClickToActionLinkWrapper),
  ],
  [
    'twenty-ui-contact-link',
    createRemoteComponentRenderer(TwentyUiContactLinkWrapper),
  ],
  [
    'twenty-ui-github-version-link',
    createRemoteComponentRenderer(TwentyUiGithubVersionLinkWrapper),
  ],
  ['twenty-ui-raw-link', createRemoteComponentRenderer(TwentyUiRawLinkWrapper)],
  [
    'twenty-ui-rounded-link',
    createRemoteComponentRenderer(TwentyUiRoundedLinkWrapper),
  ],
  [
    'twenty-ui-social-link',
    createRemoteComponentRenderer(TwentyUiSocialLinkWrapper),
  ],
  [
    'twenty-ui-undecorated-link',
    createRemoteComponentRenderer(TwentyUiUndecoratedLinkWrapper),
  ],
  [
    'twenty-ui-menu-picker',
    createRemoteComponentRenderer(TwentyUiMenuPickerWrapper),
  ],
  [
    'twenty-ui-menu-item',
    createRemoteComponentRenderer(TwentyUiMenuItemWrapper),
  ],
  [
    'twenty-ui-menu-item-avatar',
    createRemoteComponentRenderer(TwentyUiMenuItemAvatarWrapper),
  ],
  [
    'twenty-ui-menu-item-draggable',
    createRemoteComponentRenderer(TwentyUiMenuItemDraggableWrapper),
  ],
  [
    'twenty-ui-menu-item-hot-keys',
    createRemoteComponentRenderer(TwentyUiMenuItemHotKeysWrapper),
  ],
  [
    'twenty-ui-menu-item-multi-select',
    createRemoteComponentRenderer(TwentyUiMenuItemMultiSelectWrapper),
  ],
  [
    'twenty-ui-menu-item-multi-select-avatar',
    createRemoteComponentRenderer(TwentyUiMenuItemMultiSelectAvatarWrapper),
  ],
  [
    'twenty-ui-menu-item-multi-select-tag',
    createRemoteComponentRenderer(TwentyUiMenuItemMultiSelectTagWrapper),
  ],
  [
    'twenty-ui-menu-item-navigate',
    createRemoteComponentRenderer(TwentyUiMenuItemNavigateWrapper),
  ],
  [
    'twenty-ui-menu-item-select',
    createRemoteComponentRenderer(TwentyUiMenuItemSelectWrapper),
  ],
  [
    'twenty-ui-menu-item-select-avatar',
    createRemoteComponentRenderer(TwentyUiMenuItemSelectAvatarWrapper),
  ],
  [
    'twenty-ui-menu-item-select-color',
    createRemoteComponentRenderer(TwentyUiMenuItemSelectColorWrapper),
  ],
  [
    'twenty-ui-menu-item-select-tag',
    createRemoteComponentRenderer(TwentyUiMenuItemSelectTagWrapper),
  ],
  [
    'twenty-ui-menu-item-suggestion',
    createRemoteComponentRenderer(TwentyUiMenuItemSuggestionWrapper),
  ],
  [
    'twenty-ui-menu-item-toggle',
    createRemoteComponentRenderer(TwentyUiMenuItemToggleWrapper),
  ],
  [
    'twenty-ui-menu-item-left-content',
    createRemoteComponentRenderer(TwentyUiMenuItemLeftContentWrapper),
  ],
  [
    'twenty-ui-navigation-bar',
    createRemoteComponentRenderer(TwentyUiNavigationBarWrapper),
  ],
  [
    'twenty-ui-navigation-bar-item',
    createRemoteComponentRenderer(TwentyUiNavigationBarItemWrapper),
  ],
  [
    'twenty-ui-notification-counter',
    createRemoteComponentRenderer(TwentyUiNotificationCounterWrapper),
  ],
  ['remote-fragment', RemoteFragmentRenderer],
]);
