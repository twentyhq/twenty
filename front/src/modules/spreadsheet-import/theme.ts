import { ChakraStylesConfig } from 'chakra-react-select';
import { StepsTheme } from 'chakra-ui-steps';
import { PartialDeep } from 'type-fest';

import type { SelectOption } from './types';

const StepsComponent: typeof StepsTheme = {
  ...StepsTheme,
  baseStyle: (props: any) => {
    return {
      ...StepsTheme.baseStyle(props),
      label: {
        ...StepsTheme.baseStyle(props).label,
        color: 'textColor',
      },
    };
  },
  variants: {
    circles: (props: any) => ({
      ...StepsTheme.variants.circles(props),
      step: {
        ...StepsTheme.variants.circles(props).step,
        '&:not(:last-child):after': {
          ...StepsTheme.variants.circles(props).step[
            '&:not(:last-child):after'
          ],
          backgroundColor: 'background',
        },
      },
      stepIconContainer: {
        ...StepsTheme.variants.circles(props).stepIconContainer,
        bg: 'background',
        borderColor: 'background',
      },
    }),
  },
};

const MatchIconTheme: any = {
  baseStyle: () => {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      borderWidth: '2px',
      bg: 'background',
      borderColor: 'yellow.500',
      color: 'background',
      transitionDuration: 'ultra-fast',
      _highlighted: {
        bg: 'green.500',
        borderColor: 'green.500',
      },
    };
  },
  defaultProps: {
    size: 'md',
    colorScheme: 'green',
  },
};

export const themeOverrides = {
  colors: {
    textColor: '#2D3748',
    subtitleColor: '#718096',
    inactiveColor: '#A0AEC0',
    border: '#E2E8F0',
    background: 'white',
    backgroundAlpha: 'rgba(255,255,255,0)',
    secondaryBackground: '#EDF2F7',
    highlight: '#E2E8F0',
    rsi: {
      50: '#E6E6FF',
      100: '#C4C6FF',
      200: '#A2A5FC',
      300: '#8888FC',
      400: '#7069FA',
      500: '#5D55FA',
      600: '#4D3DF7',
      700: '#3525E6',
      800: '#1D0EBE',
      900: '#0C008C',
    },
  },
  shadows: {
    outline: 0,
  },
  components: {
    UploadStep: {
      baseStyle: {
        heading: {
          fontSize: '3xl',
          color: 'textColor',
          mb: '2rem',
        },
        title: {
          fontSize: '2xl',
          lineHeight: 8,
          fontWeight: 'semibold',
          color: 'textColor',
        },
        subtitle: {
          fontSize: 'md',
          lineHeight: 6,
          color: 'subtitleColor',
          mb: '1rem',
        },
        tableWrapper: {
          mb: '0.5rem',
          position: 'relative',
          h: '72px',
        },
        dropzoneText: {
          size: 'lg',
          lineHeight: 7,
          fontWeight: 'semibold',
          color: 'textColor',
        },
        dropZoneBorder: 'rsi.500',
        dropzoneButton: {
          mt: '1rem',
        },
      },
    },
    SelectSheetStep: {
      baseStyle: {
        heading: {
          color: 'textColor',
          mb: 8,
          fontSize: '3xl',
        },
        radio: {},
        radioLabel: {
          color: 'textColor',
        },
      },
    },
    SelectHeaderStep: {
      baseStyle: {
        heading: {
          color: 'textColor',
          mb: 8,
          fontSize: '3xl',
        },
      },
    },
    MatchColumnsStep: {
      baseStyle: {
        heading: {
          color: 'textColor',
          mb: 8,
          fontSize: '3xl',
        },
        title: {
          color: 'textColor',
          fontSize: '2xl',
          lineHeight: 8,
          fontWeight: 'semibold',
          mb: 4,
        },
        userTable: {
          header: {
            fontSize: 'xs',
            lineHeight: 4,
            fontWeight: 'bold',
            letterSpacing: 'wider',
            color: 'textColor',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            '&[data-ignored]': {
              color: 'inactiveColor',
            },
          },
          cell: {
            fontSize: 'sm',
            lineHeight: 5,
            fontWeight: 'medium',
            color: 'textColor',
            px: 6,
            py: 4,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            '&[data-ignored]': {
              color: 'inactiveColor',
            },
          },
          ignoreButton: {
            size: 'xs',
            colorScheme: 'gray',
            color: 'textColor',
          },
        },
        selectColumn: {
          text: {
            fontSize: 'sm',
            lineHeight: 5,
            fontWeight: 'normal',
            color: 'inactiveColor',
            px: 4,
          },
          accordionLabel: {
            color: 'blue.600',
            fontSize: 'sm',
            lineHeight: 5,
            pl: 1,
          },
          selectLabel: {
            pt: '0.375rem',
            pb: 2,
            fontSize: 'md',
            lineHeight: 6,
            fontWeight: 'medium',
            color: 'textColor',
          },
        },
        select: {
          dropdownIndicator: (provided) => ({
            ...provided,
            background: 'none',
            border: 'none',
            p: 0,
            w: '40px',
            color: 'textColor',
          }),
          control: (provided) => ({
            ...provided,
            background: 'none',
            borderRadius: '6px',
            p: 0,
            // _focus, _hover, _invalid, _readonly pseudoselectors can be used here for alternate border colors
            _focus: undefined,
          }),
          input: (provided) => ({
            ...provided,
            background: 'none',
            border: 'none',
            p: 0,
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            opacity: 0,
          }),
          singleValue: (provided) => ({
            ...provided,
            ml: 0,
            mr: 0,
          }),
          placeholder: (provided) => ({
            ...provided,
            color: 'inactiveColor',
          }),
          valueContainer: (provided) => ({
            ...provided,
            color: 'textColor',
          }),
          menu: (provided) => ({
            ...provided,
            p: 0,
            mt: 0,
          }),
          menuList: (provided) => ({
            ...provided,
            bg: 'background',
            minW: 'initial',
          }),
          option: (provided, state) => ({
            ...provided,
            color: 'textColor',
            bg: state.isSelected || state.isFocused ? 'highlight' : provided.bg,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            whiteSpace: 'nowrap',
            _hover: {
              bg: 'highlight',
            },
          }),
        } as ChakraStylesConfig<SelectOption>,
      },
    },
    ValidationStep: {
      baseStyle: {
        heading: {
          color: 'textColor',
          fontSize: '3xl',
        },
        select: {
          dropdownIndicator: (provided) => ({
            ...provided,
            background: 'none',
            border: 'none',
            p: 0,
            w: '40px',
          }),
          control: (provided) => ({
            ...provided,
            background: 'none',
            border: 'none',
            p: 0,
            _focus: undefined,
          }),
          input: (provided) => ({
            ...provided,
            background: 'none',
            border: 'none',
            p: 0,
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            opacity: 0,
          }),
          singleValue: (provided) => ({
            ...provided,
            marginInlineStart: 0,
          }),
          valueContainer: (provided) => ({
            ...provided,
            p: 0,
            paddingInlineStart: 2,
            color: 'gray.400',
          }),
          menu: (provided) => ({
            ...provided,
            p: 0,
            mt: 0,
          }),
          menuList: (provided) => ({
            ...provided,
            minW: 'initial',
          }),
          option: (provided, state) => ({
            ...provided,
            color: state.isSelected ? 'gray.900' : provided.color,
            bg:
              state.isSelected || state.isFocused
                ? 'secondaryBackground'
                : provided.bg,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            whiteSpace: 'nowrap',
          }),
        } as ChakraStylesConfig<SelectOption>,
      },
    },
    MatchIcon: MatchIconTheme,
    Steps: StepsComponent,
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'lg',
          bg: 'background',
          fontSize: 'lg',
          color: 'textColor',
        },
      },
      variants: {
        rsi: {
          header: {
            bg: 'secondaryBackground',
            px: '2rem',
            py: '1.5rem',
          },
          body: {
            bg: 'background',
            display: 'flex',
            paddingX: '2rem',
            paddingY: '2rem',
            flexDirection: 'column',
            flex: 1,
            overflow: 'auto',
            height: '100%',
          },
          footer: {
            bg: 'secondaryBackground',
            py: '1.5rem',
            justifyContent: 'center',
          },
          dialog: {
            outline: 'unset',
            minH: 'calc(100vh - 4rem)',
            maxW: 'calc(100vw - 4rem)',
            my: '2rem',
            borderRadius: '3xl',
            overflow: 'hidden',
          },
        },
      },
    },
    Button: {
      defaultProps: {
        colorScheme: 'rsi',
      },
    },
  },
  styles: {
    global: {
      '.rdg': {
        contain: 'size layout style paint',
        borderRadius: 'lg',
        border: 'none',
        borderTop: '1px solid var(--rdg-border-color)',
        blockSize: '100%',

        // we have to use vars here because chakra does not autotransform unknown props
        '--rdg-row-height': '35px',
        '--rdg-color': 'var(--chakra-colors-textColor)',
        '--rdg-background-color': 'var(--chakra-colors-background)',
        '--rdg-header-background-color': 'var(--chakra-colors-background)',
        '--rdg-row-hover-background-color': 'var(--chakra-colors-background)',
        '--rdg-selection-color': 'var(--chakra-colors-blue-400)',
        '--rdg-row-selected-background-color': 'var(--chakra-colors-rsi-50)',
        '--row-selected-hover-background-color': 'var(--chakra-colors-rsi-100)',
        '--rdg-error-cell-background-color': 'var(--chakra-colors-red-50)',
        '--rdg-warning-cell-background-color': 'var(--chakra-colors-orange-50)',
        '--rdg-info-cell-background-color': 'var(--chakra-colors-blue-50)',
        '--rdg-border-color': 'var(--chakra-colors-border)',
        '--rdg-frozen-cell-box-shadow': 'none',
        '--rdg-font-size': 'var(--chakra-fontSizes-sm)',
      },
      '.rdg-header-row .rdg-cell': {
        color: 'textColor',
        fontSize: 'xs',
        lineHeight: 10,
        fontWeight: 'bold',
        letterSpacing: 'wider',
        textTransform: 'uppercase',
        '&:first-of-type': {
          borderTopLeftRadius: 'lg',
        },
        '&:last-child': {
          borderTopRightRadius: 'lg',
        },
      },
      '.rdg-row:last-child .rdg-cell:first-of-type': {
        borderBottomLeftRadius: 'lg',
      },
      '.rdg-row:last-child .rdg-cell:last-child': {
        borderBottomRightRadius: 'lg',
      },
      ".rdg[dir='rtl']": {
        '.rdg-row:last-child .rdg-cell:first-of-type': {
          borderBottomRightRadius: 'lg',
          borderBottomLeftRadius: 'none',
        },
        '.rdg-row:last-child .rdg-cell:last-child': {
          borderBottomLeftRadius: 'lg',
          borderBottomRightRadius: 'none',
        },
      },
      '.rdg-cell': {
        contain: 'size layout style paint',
        borderRight: 'none',
        borderInlineEnd: 'none',
        borderBottom: '1px solid var(--rdg-border-color)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        "&[aria-selected='true']": {
          boxShadow: 'inset 0 0 0 1px var(--rdg-selection-color)',
        },
        '&:first-of-type': {
          boxShadow: 'none',
          borderInlineStart: '1px solid var(--rdg-border-color)',
        },
        '&:last-child': {
          borderInlineEnd: '1px solid var(--rdg-border-color)',
        },
      },
      '.rdg-cell-error': {
        backgroundColor: 'var(--rdg-error-cell-background-color)',
      },
      '.rdg-cell-warning': {
        backgroundColor: 'var(--rdg-warning-cell-background-color)',
      },
      '.rdg-cell-info': {
        backgroundColor: 'var(--rdg-info-cell-background-color)',
      },
      '.rdg-static': {
        cursor: 'pointer',
      },
      '.rdg-static .rdg-header-row': {
        display: 'none',
      },
      '.rdg-static .rdg-cell': {
        '--rdg-selection-color': 'none',
      },
      '.rdg-example .rdg-cell': {
        '--rdg-selection-color': 'none',
        borderBottom: 'none',
      },

      '.rdg-radio': {
        display: 'flex',
        alignItems: 'center',
      },
      '.rdg-checkbox': {
        '--rdg-selection-color': 'none',
        display: 'flex',
        alignItems: 'center',
      },
    },
  },
} as const;

export const rtlThemeSupport = {
  components: {
    Modal: {
      baseStyle: {
        dialog: {
          direction: 'rtl',
        },
      },
    },
  },
} as const;

export type CustomTheme = PartialDeep<typeof themeOverrides>;
