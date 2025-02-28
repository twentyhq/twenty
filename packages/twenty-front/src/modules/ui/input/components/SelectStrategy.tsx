import { MouseEvent, useMemo, useRef, useState } from 'react';

import { SelectValue } from './Select';
import { SelectSizeVariant, SelectOption } from './Select';
import { IconComponent } from 'twenty-ui';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};

export enum StrategyType {
    STRATEGY_ONE = 'STRATEGY_ONE',
    STRATEGY_TWO = 'STRATEGY_TWO',
    STRATEGY_THREE = 'STRATEGY_THREE'
}

export type SelectObject<Value extends SelectValue> = {
    className?: string;
    disabled?: boolean;
    selectSizeVariant?: SelectSizeVariant;
    dropdownId: string;
    dropdownWidth?: `${string}px` | 'auto' | number;
    dropdownWidthAuto?: boolean;
    emptyOption?: SelectOption<Value>;
    fullWidth?: boolean;
    label?: string;
    onChange?: (value: Value) => void;
    onBlur?: () => void;
    options: SelectOption<Value>[];
    value?: Value;
    withSearchInput?: boolean;
    needIconCheck?: boolean;
    callToActionButton?: CallToActionButton;
}


export const selectObjects: Record<StrategyType, SelectObject<string>> = {
    [StrategyType.STRATEGY_ONE]: {
        dropdownId: 'strategy-one-dropdown',
        options: [],
        label: 'Strategy One',
    },
    [StrategyType.STRATEGY_TWO]: {
        dropdownId: 'strategy-two-dropdown',
        options: [],
        label: 'Strategy Two',
    },
    [StrategyType.STRATEGY_THREE]: {
        dropdownId: 'strategy-three-dropdown',
        options: [],
        label: 'Strategy Three',
    },
};