import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

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
        yellow: string;
        green: string;
        turquoise: string;
        sky: string;
        blue: string;
        purple: string;
        pink: string;
        red: string;
        orange: string;
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
    spacing: (multiplicator: number) => string;
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

type CheckmarkProps = React.ComponentPropsWithoutRef<'div'>;
declare const Checkmark: (_props: CheckmarkProps) => react_jsx_runtime.JSX.Element;

declare const ThemeProvider: ({ children }: {
    children: any;
}) => react_jsx_runtime.JSX.Element;
declare module '@emotion/react' {
    interface Theme extends ThemeType {
    }
}

export { Checkmark, CheckmarkProps, ThemeProvider };
