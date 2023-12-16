import * as _emotion_react from '@emotion/react';
export { ThemeProvider } from '@emotion/react';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import react__default, { ReactNode, MouseEvent, FunctionComponent, ComponentProps, InputHTMLAttributes } from 'react';
import { motion, AnimationControls } from 'framer-motion';
import { TablerIconsProps } from '@tabler/icons-react';
import { PlacesType, PositionStrategy } from 'react-tooltip';
import { BlockNoteEditor } from '@blocknote/core';
import * as _emotion_styled from '@emotion/styled';

declare const lightTheme: {
    accent: {
        primary: string;
        secondary: string;
        tertiary: string;
        quaternary: string;
        accent3570: string;
        accent4060: string;
    };
    background: {
        noisy: string;
        primary: string;
        secondary: string;
        tertiary: string;
        quaternary: string;
        danger: string;
        transparent: {
            primary: string;
            secondary: string;
            strong: string;
            medium: string;
            light: string;
            lighter: string;
            danger: string;
        };
        overlay: string;
        radialGradient: string;
        radialGradientHover: string;
    };
    border: {
        radius: {
            xs: string;
            sm: string;
            md: string;
            xl: string;
            pill: string;
            rounded: string;
        };
        color: {
            strong: string;
            medium: string;
            light: string;
            secondaryInverted: string;
            inverted: string;
            danger: string;
        };
    };
    tag: {
        [key: string]: {
            [key: string]: string;
        };
    };
    boxShadow: {
        extraLight: string;
        light: string;
        strong: string;
        underline: string;
    };
    font: {
        size: {
            xxs: string;
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            xxl: string;
        };
        weight: {
            regular: number;
            medium: number;
            semiBold: number;
        };
        family: string;
        color: {
            primary: string;
            secondary: string;
            tertiary: string;
            light: string;
            extraLight: string;
            inverted: string;
            danger: string;
        };
    };
    name: string;
    color: {
        yellow80: string;
        yellow70: string;
        yellow60: string;
        yellow50: string;
        yellow40: string;
        yellow30: string;
        yellow20: string;
        yellow10: string;
        green80: string;
        green70: string;
        green60: string;
        green50: string;
        green40: string;
        green30: string;
        green20: string;
        green10: string;
        turquoise80: string;
        turquoise70: string;
        turquoise60: string;
        turquoise50: string;
        turquoise40: string;
        turquoise30: string;
        turquoise20: string;
        turquoise10: string;
        sky80: string;
        sky70: string;
        sky60: string;
        sky50: string;
        sky40: string;
        sky30: string;
        sky20: string;
        sky10: string;
        blue80: string;
        blue70: string;
        blue60: string;
        blue50: string;
        blue40: string;
        blue30: string;
        blue20: string;
        blue10: string;
        purple80: string;
        purple70: string;
        purple60: string;
        purple50: string;
        purple40: string;
        purple30: string;
        purple20: string;
        purple10: string;
        pink80: string;
        pink70: string;
        pink60: string;
        pink50: string;
        pink40: string;
        pink30: string;
        pink20: string;
        pink10: string;
        red80: string;
        red70: string;
        red60: string;
        red50: string;
        red40: string;
        red30: string;
        red20: string;
        red10: string;
        orange80: string;
        orange70: string;
        orange60: string;
        orange50: string;
        orange40: string;
        orange30: string;
        orange20: string;
        orange10: string;
        gray80: string;
        gray70: string;
        gray60: string;
        gray50: string;
        gray40: string;
        gray30: string;
        gray20: string;
        gray10: string;
        blueAccent90: string;
        blueAccent85: string;
        blueAccent80: string;
        blueAccent75: string;
        blueAccent70: string;
        blueAccent60: string;
        blueAccent40: string;
        blueAccent35: string;
        blueAccent25: string;
        blueAccent20: string;
        blueAccent15: string;
        blueAccent10: string;
        green: string;
        turquoise: string;
        sky: string;
        blue: string;
        purple: string;
        pink: string;
        red: string;
        orange: string;
        yellow: string;
        gray: string;
    };
    grayScale: {
        gray100: string;
        gray90: string;
        gray85: string;
        gray80: string;
        gray75: string;
        gray70: string;
        gray65: string;
        gray60: string;
        gray55: string;
        gray50: string;
        gray45: string;
        gray40: string;
        gray35: string;
        gray30: string;
        gray25: string;
        gray20: string;
        gray15: string;
        gray10: string;
        gray0: string;
    };
    icon: {
        size: {
            sm: number;
            md: number;
            lg: number;
            xl: number;
        };
        stroke: {
            sm: number;
            md: number;
            lg: number;
        };
    };
    modal: {
        size: {
            sm: string;
            md: string;
            lg: string;
        };
    };
    text: {
        lineHeight: {
            lg: number;
            md: number;
        };
        iconSizeMedium: number;
        iconSizeSmall: number;
        iconStrikeLight: number;
        iconStrikeMedium: number;
        iconStrikeBold: number;
    };
    blur: {
        light: string;
        strong: string;
    };
    animation: {
        duration: {
            instant: number;
            fast: number;
            normal: number;
        };
    };
    snackBar: {
        success: {
            background: string;
            color: string;
        };
        error: {
            background: string;
            color: string;
        };
        info: {
            background: string;
            color: string;
        };
    };
    spacingMultiplicator: number;
    spacing: (...args: number[]) => string;
    betweenSiblingsGap: string;
    table: {
        horizontalCellMargin: string;
        checkboxColumnWidth: string;
    };
    rightDrawerWidth: string;
    clickableElementBackgroundTransition: string;
    lastLayerZIndex: number;
};
type ThemeType = typeof lightTheme;
declare const darkTheme: ThemeType;

type CheckmarkProps = react__default.ComponentPropsWithoutRef<'div'> & {
    className?: string;
};
declare const Checkmark: ({ className }: CheckmarkProps) => react_jsx_runtime.JSX.Element;

type AnimatedCheckmarkProps = React.ComponentProps<typeof motion.path> & {
    isAnimating?: boolean;
    color?: string;
    duration?: number;
    size?: number;
};
declare const AnimatedCheckmark: ({ isAnimating, color, duration, size, }: AnimatedCheckmarkProps) => react_jsx_runtime.JSX.Element;

declare enum ChipSize {
    Large = "large",
    Small = "small"
}
declare enum ChipAccent {
    TextPrimary = "text-primary",
    TextSecondary = "text-secondary"
}
declare enum ChipVariant {
    Highlighted = "highlighted",
    Regular = "regular",
    Transparent = "transparent",
    Rounded = "rounded"
}
type ChipProps = {
    size?: ChipSize;
    disabled?: boolean;
    clickable?: boolean;
    label: string;
    maxWidth?: string;
    variant?: ChipVariant;
    accent?: ChipAccent;
    leftComponent?: ReactNode;
    rightComponent?: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLDivElement>) => void;
};
declare const Chip: ({ size, label, disabled, clickable, variant, leftComponent, rightComponent, accent, maxWidth, className, onClick, }: ChipProps) => react_jsx_runtime.JSX.Element;

type IconComponent = FunctionComponent<{
    className?: string;
    color?: string;
    size?: number;
    stroke?: number;
}>;

type AvatarType = 'squared' | 'rounded';

type EntityChipProps = {
    linkToEntity?: string;
    entityId: string;
    name: string;
    avatarUrl?: string;
    avatarType?: AvatarType;
    variant?: EntityChipVariant;
    LeftIcon?: IconComponent;
    className?: string;
};
declare enum EntityChipVariant {
    Regular = "regular",
    Transparent = "transparent"
}
declare const EntityChip: ({ linkToEntity, entityId, name, avatarUrl, avatarType, variant, LeftIcon, className, }: EntityChipProps) => react_jsx_runtime.JSX.Element;

type IconAddressBookProps = TablerIconsProps;
declare const IconAddressBook: (props: IconAddressBookProps) => JSX.Element;

type SoonPillProps = {
    className?: string;
};
declare const SoonPill: ({ className }: SoonPillProps) => react_jsx_runtime.JSX.Element;

declare const mainColors: {
    green: string;
    turquoise: string;
    sky: string;
    blue: string;
    purple: string;
    pink: string;
    red: string;
    orange: string;
    yellow: string;
    gray: string;
};
type ThemeColor = keyof typeof mainColors;

type TagProps = {
    className?: string;
    color: ThemeColor;
    text: string;
    onClick?: () => void;
};
declare const Tag: ({ className, color, text, onClick }: TagProps) => react_jsx_runtime.JSX.Element;

declare enum TooltipPosition {
    Top = "top",
    Left = "left",
    Right = "right",
    Bottom = "bottom"
}
type AppTooltipProps = {
    className?: string;
    anchorSelect?: string;
    content?: string;
    delayHide?: number;
    offset?: number;
    noArrow?: boolean;
    isOpen?: boolean;
    place?: PlacesType;
    positionStrategy?: PositionStrategy;
};
declare const AppTooltip: ({ anchorSelect, className, content, delayHide, isOpen, noArrow, offset, place, positionStrategy, }: AppTooltipProps) => react_jsx_runtime.JSX.Element;

declare const OverflowingTextWithTooltip: ({ text, className, }: {
    text: string | null | undefined;
    className?: string | undefined;
}) => react_jsx_runtime.JSX.Element;

type ProgressBarProps = {
    duration?: number;
    delay?: number;
    easing?: string;
    barHeight?: number;
    barColor?: string;
    autoStart?: boolean;
    className?: string;
};
type StyledBarProps = {
    barHeight?: number;
    className?: string;
};
type ProgressBarControls = AnimationControls & {
    start: () => Promise<any>;
    pause: () => Promise<any>;
};
declare const ProgressBar: react.ForwardRefExoticComponent<ProgressBarProps & react.RefAttributes<ProgressBarControls>>;

interface CircularProgressBarProps {
    size?: number;
    barWidth?: number;
    barColor?: string;
}
declare const CircularProgressBar: ({ size, barWidth, barColor, }: CircularProgressBarProps) => react_jsx_runtime.JSX.Element;

type ButtonSize = 'medium' | 'small';
type ButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
type ButtonAccent = 'default' | 'blue' | 'danger';
type ButtonProps = {
    className?: string;
    Icon?: IconComponent;
    title?: string;
    fullWidth?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
    position?: ButtonPosition;
    accent?: ButtonAccent;
    soon?: boolean;
    disabled?: boolean;
    focus?: boolean;
    onClick?: (event: react__default.MouseEvent<HTMLButtonElement>) => void;
};
declare const Button: ({ className, Icon, title, fullWidth, variant, size, accent, position, soon, disabled, focus, onClick, }: ButtonProps) => react_jsx_runtime.JSX.Element;

type ButtonGroupProps = Pick<ButtonProps, 'variant' | 'size' | 'accent'> & {
    className?: string;
    children: ReactNode[];
};
declare const ButtonGroup: ({ className, children, variant, size, accent, }: ButtonGroupProps) => react_jsx_runtime.JSX.Element;

type FloatingButtonSize = 'small' | 'medium';
type FloatingButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
type FloatingButtonProps = {
    className?: string;
    Icon?: IconComponent;
    title?: string;
    size?: FloatingButtonSize;
    position?: FloatingButtonPosition;
    applyShadow?: boolean;
    applyBlur?: boolean;
    disabled?: boolean;
    focus?: boolean;
};
declare const FloatingButton: ({ className, Icon, title, size, applyBlur, applyShadow, disabled, focus, }: FloatingButtonProps) => react_jsx_runtime.JSX.Element;

type FloatingButtonGroupProps = Pick<FloatingButtonProps, 'size'> & {
    children: react__default.ReactElement[];
    className?: string;
};
declare const FloatingButtonGroup: ({ children, size, className, }: FloatingButtonGroupProps) => react_jsx_runtime.JSX.Element;

type FloatingIconButtonSize = 'small' | 'medium';
type FloatingIconButtonPosition = 'standalone' | 'left' | 'middle' | 'right';
type FloatingIconButtonProps = {
    className?: string;
    Icon?: IconComponent;
    size?: FloatingIconButtonSize;
    position?: FloatingIconButtonPosition;
    applyShadow?: boolean;
    applyBlur?: boolean;
    disabled?: boolean;
    focus?: boolean;
    onClick?: (event: react__default.MouseEvent<HTMLButtonElement>) => void;
    isActive?: boolean;
};
declare const FloatingIconButton: ({ className, Icon, size, position, applyShadow, applyBlur, disabled, focus, onClick, isActive, }: FloatingIconButtonProps) => react_jsx_runtime.JSX.Element;

type FloatingIconButtonGroupProps = Pick<FloatingIconButtonProps, 'className' | 'size'> & {
    iconButtons: {
        Icon: IconComponent;
        onClick?: (event: MouseEvent<any>) => void;
        isActive?: boolean;
    }[];
};
declare const FloatingIconButtonGroup: ({ iconButtons, size, className, }: FloatingIconButtonGroupProps) => react_jsx_runtime.JSX.Element;

type LightButtonAccent = 'secondary' | 'tertiary';
type LightButtonProps = {
    className?: string;
    Icon?: IconComponent;
    title?: string;
    accent?: LightButtonAccent;
    active?: boolean;
    disabled?: boolean;
    focus?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};
declare const LightButton: ({ className, Icon, title, active, accent, disabled, focus, onClick, }: LightButtonProps) => react_jsx_runtime.JSX.Element;

type LightIconButtonAccent = 'secondary' | 'tertiary';
type LightIconButtonSize = 'small' | 'medium';
type LightIconButtonProps = {
    className?: string;
    testId?: string;
    Icon?: IconComponent;
    title?: string;
    size?: LightIconButtonSize;
    accent?: LightIconButtonAccent;
    active?: boolean;
    disabled?: boolean;
    focus?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'>;
declare const LightIconButton: ({ "aria-label": ariaLabel, className, testId, Icon, active, size, accent, disabled, focus, onClick, title, }: LightIconButtonProps) => react_jsx_runtime.JSX.Element;

type Variant = 'primary' | 'secondary';
type Props = {
    title: string;
    fullWidth?: boolean;
    variant?: Variant;
    soon?: boolean;
} & react__default.ComponentProps<'button'>;
type MainButtonProps = Props & {
    Icon?: IconComponent;
};
declare const MainButton: ({ Icon, title, fullWidth, variant, type, onClick, disabled, className, }: MainButtonProps) => react_jsx_runtime.JSX.Element;

type RoundedIconButtonProps = {
    Icon: IconComponent;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;
declare const RoundedIconButton: ({ Icon, onClick, disabled, className, }: RoundedIconButtonProps) => react_jsx_runtime.JSX.Element;

type ColorScheme = 'Dark' | 'Light' | 'System';

type ColorSchemeSegmentProps = {
    variant: ColorScheme;
    controls: AnimationControls;
    className?: string;
} & react__default.ComponentPropsWithoutRef<'div'>;
type ColorSchemeCardProps = {
    variant: ColorScheme;
    selected?: boolean;
} & react__default.ComponentPropsWithoutRef<'div'>;
declare const ColorSchemeCard: ({ variant, selected, onClick, }: ColorSchemeCardProps) => react_jsx_runtime.JSX.Element;

type ColorSchemePickerProps = {
    value: ColorScheme;
    className?: string;
    onChange: (value: ColorScheme) => void;
};
declare const ColorSchemePicker: ({ value, onChange, className, }: ColorSchemePickerProps) => react_jsx_runtime.JSX.Element;

declare enum AutosizeTextInputVariant {
    Default = "default",
    Icon = "icon",
    Button = "button"
}
type AutosizeTextInputProps = {
    onValidate?: (text: string) => void;
    minRows?: number;
    placeholder?: string;
    onFocus?: () => void;
    variant?: AutosizeTextInputVariant;
    buttonTitle?: string;
    value?: string;
    className?: string;
};
declare const AutosizeTextInput: ({ placeholder, onValidate, minRows, onFocus, variant, buttonTitle, value, className, }: AutosizeTextInputProps) => react_jsx_runtime.JSX.Element;

declare enum CheckboxVariant {
    Primary = "primary",
    Secondary = "secondary",
    Tertiary = "tertiary"
}
declare enum CheckboxShape {
    Squared = "squared",
    Rounded = "rounded"
}
declare enum CheckboxSize {
    Large = "large",
    Small = "small"
}
type CheckboxProps = {
    checked: boolean;
    indeterminate?: boolean;
    onChange?: (event: react.ChangeEvent<HTMLInputElement>) => void;
    onCheckedChange?: (value: boolean) => void;
    variant?: CheckboxVariant;
    size?: CheckboxSize;
    shape?: CheckboxShape;
    className?: string;
};
declare const Checkbox: ({ checked, onChange, onCheckedChange, indeterminate, variant, size, shape, className, }: CheckboxProps) => react_jsx_runtime.JSX.Element;

type EntityTitleDoubleTextInputProps = {
    firstValue: string;
    secondValue: string;
    firstValuePlaceholder: string;
    secondValuePlaceholder: string;
    onChange: (firstValue: string, secondValue: string) => void;
    className?: string;
};
declare const EntityTitleDoubleTextInput: ({ firstValue, secondValue, firstValuePlaceholder, secondValuePlaceholder, onChange, className, }: EntityTitleDoubleTextInputProps) => react_jsx_runtime.JSX.Element;

type IconButtonVariant = 'primary' | 'secondary' | 'tertiary';

type IconPickerProps = {
    disabled?: boolean;
    dropdownScopeId?: string;
    onChange: (params: {
        iconKey: string;
        Icon: IconComponent;
    }) => void;
    selectedIconKey?: string;
    onClickOutside?: () => void;
    onClose?: () => void;
    onOpen?: () => void;
    variant?: IconButtonVariant;
    className?: string;
};
declare const IconPicker: ({ disabled, dropdownScopeId, onChange, selectedIconKey, onClickOutside, onClose, onOpen, variant, className, }: IconPickerProps) => react_jsx_runtime.JSX.Element;

type ImageInputProps = Omit<react__default.ComponentProps<'div'>, 'children'> & {
    picture: string | null | undefined;
    onUpload?: (file: File) => void;
    onRemove?: () => void;
    onAbort?: () => void;
    isUploading?: boolean;
    errorMessage?: string | null;
    disabled?: boolean;
    className?: string;
};
declare const ImageInput: ({ picture, onUpload, onRemove, onAbort, isUploading, errorMessage, disabled, className, }: ImageInputProps) => react_jsx_runtime.JSX.Element;

declare enum RadioSize {
    Large = "large",
    Small = "small"
}
declare enum LabelPosition {
    Left = "left",
    Right = "right"
}
type RadioProps = {
    style?: react.CSSProperties;
    className?: string;
    checked?: boolean;
    value?: string;
    onChange?: (event: react.ChangeEvent<HTMLInputElement>) => void;
    onCheckedChange?: (checked: boolean) => void;
    size?: RadioSize;
    disabled?: boolean;
    labelPosition?: LabelPosition;
};
declare const Radio: {
    ({ checked, value, onChange, onCheckedChange, size, labelPosition, disabled, className, }: RadioProps): react_jsx_runtime.JSX.Element;
    Group: ({ value, onChange, onValueChange, children, }: {
        children?: react.ReactNode;
    } & {
        value?: string | undefined;
        onChange?: ((event: react.ChangeEvent<HTMLInputElement>) => void) | undefined;
        onValueChange?: ((value: string) => void) | undefined;
    }) => react_jsx_runtime.JSX.Element;
};

type RadioGroupProps = react__default.PropsWithChildren & {
    value?: string;
    onChange?: (event: react__default.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: string) => void;
};
declare const RadioGroup: ({ value, onChange, onValueChange, children, }: RadioGroupProps) => react_jsx_runtime.JSX.Element;

type SelectProps<Value extends string | number | null> = {
    className?: string;
    disabled?: boolean;
    dropdownScopeId: string;
    fullWidth?: boolean;
    label?: string;
    onChange?: (value: Value) => void;
    options: {
        value: Value;
        label: string;
        Icon?: IconComponent;
    }[];
    value?: Value;
};
declare const Select: <Value extends string | number | null>({ className, disabled, dropdownScopeId, fullWidth, label, onChange, options, value, }: SelectProps<Value>) => react_jsx_runtime.JSX.Element;

type TextAreaProps = {
    disabled?: boolean;
    minRows?: number;
    onChange?: (value: string) => void;
    placeholder?: string;
    value?: string;
    className?: string;
};
declare const TextArea: ({ disabled, placeholder, minRows, value, className, onChange, }: TextAreaProps) => react_jsx_runtime.JSX.Element;

type TextInputComponentProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onKeyDown'> & {
    className?: string;
    label?: string;
    onChange?: (text: string) => void;
    fullWidth?: boolean;
    disableHotkeys?: boolean;
    error?: string;
    RightIcon?: IconComponent;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};
declare const TextInput: react.ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "onKeyDown"> & {
    className?: string | undefined;
    label?: string | undefined;
    onChange?: ((text: string) => void) | undefined;
    fullWidth?: boolean | undefined;
    disableHotkeys?: boolean | undefined;
    error?: string | undefined;
    RightIcon?: IconComponent | undefined;
    onKeyDown?: ((event: React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
} & react.RefAttributes<HTMLInputElement>>;

type ToggleSize = 'small' | 'medium';
type ToggleProps = {
    value?: boolean;
    onChange?: (value: boolean) => void;
    color?: string;
    toggleSize?: ToggleSize;
    className?: string;
};
declare const Toggle: ({ value, onChange, color, toggleSize, className, }: ToggleProps) => react_jsx_runtime.JSX.Element;

interface BlockEditorProps {
    editor: BlockNoteEditor;
}
declare const BlockEditor: ({ editor }: BlockEditorProps) => react_jsx_runtime.JSX.Element;

type ContactLinkProps = {
    className?: string;
    href: string;
    children?: react.ReactNode;
    onClick?: (event: react.MouseEvent<HTMLElement>) => void;
};
declare const ContactLink: ({ className, href, children, onClick, }: ContactLinkProps) => react_jsx_runtime.JSX.Element;

type RawLinkProps = {
    className?: string;
    href: string;
    children?: react.ReactNode;
    onClick?: (event: react.MouseEvent<HTMLElement>) => void;
};
declare const RawLink: ({ className, href, children, onClick, }: RawLinkProps) => react_jsx_runtime.JSX.Element;

type RoundedLinkProps = {
    href: string;
    children?: react.ReactNode;
    onClick?: (event: react.MouseEvent<HTMLElement>) => void;
};
declare const RoundedLink: ({ children, href, onClick }: RoundedLinkProps) => react_jsx_runtime.JSX.Element;

declare enum LinkType {
    Url = "url",
    LinkedIn = "linkedin",
    Twitter = "twitter"
}
type SocialLinkProps = {
    href: string;
    children?: react.ReactNode;
    type?: LinkType;
    onClick?: (event: react.MouseEvent<HTMLElement>) => void;
};
declare const SocialLink: ({ children, href, onClick, type, }: SocialLinkProps) => react_jsx_runtime.JSX.Element;

type MenuItemAccent = 'default' | 'danger' | 'placeholder';

type MenuItemIconButton = {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
};
type MenuItemProps = {
    LeftIcon?: IconComponent | null;
    accent?: MenuItemAccent;
    text: string;
    iconButtons?: MenuItemIconButton[];
    isTooltipOpen?: boolean;
    className?: string;
    testId?: string;
    onClick?: (event: MouseEvent<HTMLLIElement>) => void;
};
declare const MenuItem: ({ LeftIcon, accent, text, iconButtons, isTooltipOpen, className, testId, onClick, }: MenuItemProps) => react_jsx_runtime.JSX.Element;

type MenuItemCommandProps = {
    LeftIcon?: IconComponent;
    text: string;
    firstHotKey?: string;
    secondHotKey?: string;
    className?: string;
    isSelected?: boolean;
    onClick?: () => void;
};
declare const MenuItemCommand: ({ LeftIcon, text, firstHotKey, secondHotKey, className, isSelected, onClick, }: MenuItemCommandProps) => react_jsx_runtime.JSX.Element;

type MenuItemDraggableProps = {
    LeftIcon: IconComponent | undefined;
    accent?: MenuItemAccent;
    iconButtons?: MenuItemIconButton[];
    isTooltipOpen?: boolean;
    onClick?: () => void;
    text: string;
    isDragDisabled?: boolean;
    className?: string;
};
declare const MenuItemDraggable: ({ LeftIcon, accent, iconButtons, isTooltipOpen, onClick, text, isDragDisabled, className, }: MenuItemDraggableProps) => react_jsx_runtime.JSX.Element;

type MenuItemMultiSelectProps = {
    LeftIcon?: IconComponent;
    selected: boolean;
    text: string;
    className: string;
    onSelectChange?: (selected: boolean) => void;
};
declare const MenuItemMultiSelect: ({ LeftIcon, text, selected, className, onSelectChange, }: MenuItemMultiSelectProps) => react_jsx_runtime.JSX.Element;

type MenuItemMultiSelectAvatarProps = {
    avatar?: ReactNode;
    selected: boolean;
    isKeySelected?: boolean;
    text: string;
    className?: string;
    onSelectChange?: (selected: boolean) => void;
};
declare const MenuItemMultiSelectAvatar: ({ avatar, text, selected, className, isKeySelected, onSelectChange, }: MenuItemMultiSelectAvatarProps) => react_jsx_runtime.JSX.Element;

type MenuItemNavigateProps = {
    LeftIcon?: IconComponent;
    text: string;
    onClick?: () => void;
    className?: string;
};
declare const MenuItemNavigate: ({ LeftIcon, text, className, onClick, }: MenuItemNavigateProps) => react_jsx_runtime.JSX.Element;

type MenuItemBaseProps = {
    accent?: MenuItemAccent;
    isKeySelected?: boolean;
};

declare const StyledMenuItemSelect: _emotion_styled.StyledComponent<{
    theme?: _emotion_react.Theme | undefined;
    as?: react.ElementType<any> | undefined;
} & MenuItemBaseProps & react.ClassAttributes<HTMLLIElement> & react.LiHTMLAttributes<HTMLLIElement> & {
    theme?: _emotion_react.Theme | undefined;
} & {
    selected: boolean;
    disabled?: boolean | undefined;
    hovered?: boolean | undefined;
}, {}, {}>;
type MenuItemSelectProps = {
    LeftIcon: IconComponent | null | undefined;
    selected: boolean;
    text: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    hovered?: boolean;
};
declare const MenuItemSelect: ({ LeftIcon, text, selected, className, onClick, disabled, hovered, }: MenuItemSelectProps) => react_jsx_runtime.JSX.Element;

type MenuItemSelectAvatarProps = {
    avatar: ReactNode;
    selected: boolean;
    text: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    hovered?: boolean;
    testId?: string;
};
declare const MenuItemSelectAvatar: ({ avatar, text, selected, className, onClick, disabled, hovered, testId, }: MenuItemSelectAvatarProps) => react_jsx_runtime.JSX.Element;

type ColorSampleVariant = 'default' | 'pipeline';

type MenuItemSelectColorProps = {
    selected: boolean;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    hovered?: boolean;
    color: ThemeColor;
    variant?: ColorSampleVariant;
};
declare const colorLabels: Record<ThemeColor, string>;
declare const MenuItemSelectColor: ({ color, selected, className, onClick, disabled, hovered, variant, }: MenuItemSelectColorProps) => react_jsx_runtime.JSX.Element;

type MenuItemToggleProps = {
    LeftIcon?: IconComponent;
    toggled: boolean;
    text: string;
    className?: string;
    onToggleChange?: (toggled: boolean) => void;
    toggleSize?: ToggleSize;
};
declare const MenuItemToggle: ({ LeftIcon, text, toggled, className, onToggleChange, toggleSize, }: MenuItemToggleProps) => react_jsx_runtime.JSX.Element;

type BreadcrumbProps = {
    className?: string;
    links: {
        children: string;
        href?: string;
    }[];
};
declare const Breadcrumb: ({ className, links }: BreadcrumbProps) => react_jsx_runtime.JSX.Element;

type NavigationBarProps = {
    activeItemName: string;
    items: {
        name: string;
        Icon: IconComponent;
        onClick: () => void;
    }[];
};
declare const NavigationBar: ({ activeItemName, items, }: NavigationBarProps) => react_jsx_runtime.JSX.Element;

type StepProps = React.PropsWithChildren & React.ComponentProps<'div'> & {
    isActive?: boolean;
    isLast?: boolean;
    index?: number;
    label: string;
};

type StepBarProps = react__default.PropsWithChildren & react__default.ComponentProps<'div'> & {
    activeStep: number;
};
declare const StepBar: {
    ({ activeStep, children }: StepBarProps): react_jsx_runtime.JSX.Element;
    Step: {
        ({ isActive, isLast, index, label, children, }: StepProps): react_jsx_runtime.JSX.Element;
        displayName: string;
    };
};

declare module '@emotion/react' {
    interface Theme extends ThemeType {
    }
}

export { AnimatedCheckmark, type AnimatedCheckmarkProps, AppTooltip, type AppTooltipProps, AutosizeTextInput, AutosizeTextInputVariant, BlockEditor, Breadcrumb, Button, type ButtonAccent, ButtonGroup, type ButtonGroupProps, type ButtonPosition, type ButtonProps, type ButtonSize, type ButtonVariant, Checkbox, CheckboxShape, CheckboxSize, CheckboxVariant, Checkmark, type CheckmarkProps, Chip, ChipAccent, ChipSize, ChipVariant, CircularProgressBar, ColorSchemeCard, type ColorSchemeCardProps, ColorSchemePicker, type ColorSchemePickerProps, type ColorSchemeSegmentProps, ContactLink, EntityChip, type EntityChipProps, EntityChipVariant, EntityTitleDoubleTextInput, type EntityTitleDoubleTextInputProps, FloatingButton, FloatingButtonGroup, type FloatingButtonGroupProps, type FloatingButtonPosition, type FloatingButtonProps, type FloatingButtonSize, FloatingIconButton, FloatingIconButtonGroup, type FloatingIconButtonGroupProps, type FloatingIconButtonPosition, type FloatingIconButtonProps, type FloatingIconButtonSize, IconAddressBook, IconPicker, ImageInput, LabelPosition, LightButton, type LightButtonAccent, type LightButtonProps, LightIconButton, type LightIconButtonAccent, type LightIconButtonProps, type LightIconButtonSize, LinkType, MainButton, MenuItem, MenuItemCommand, type MenuItemCommandProps, MenuItemDraggable, type MenuItemDraggableProps, type MenuItemIconButton, MenuItemMultiSelect, MenuItemMultiSelectAvatar, MenuItemNavigate, type MenuItemNavigateProps, type MenuItemProps, MenuItemSelect, MenuItemSelectAvatar, MenuItemSelectColor, MenuItemToggle, NavigationBar, OverflowingTextWithTooltip, ProgressBar, type ProgressBarControls, type ProgressBarProps, Radio, RadioGroup, type RadioProps, RadioSize, RawLink, RoundedIconButton, RoundedLink, Select, type SelectProps, SocialLink, SoonPill, StepBar, type StepBarProps, type StyledBarProps, StyledMenuItemSelect, Tag, TextArea, type TextAreaProps, TextInput, type TextInputComponentProps, Toggle, type ToggleProps, type ToggleSize, TooltipPosition, colorLabels, darkTheme, lightTheme };
