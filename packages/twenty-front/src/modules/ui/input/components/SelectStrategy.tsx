import { MouseEvent, useMemo, useRef, useState } from 'react';

import { SelectValue } from './Select';
import { SelectSizeVariant, SelectOption } from './Select';
import { IconComponent } from 'twenty-ui';

type CallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  Icon?: IconComponent;
};


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

export const analyticsGraphWindowLengthStrategy: SelectObject<string> = {
    dropdownId: 'analytics-graph-window-length-dropdown',
    options: [
        { value: '7D', label: 'This week' },
        { value: '1D', label: 'Today' },
        { value: '12H', label: 'Last 12 hours' },
        { value: '4H', label: 'Last 4 hours' },
    ],
    label: 'Select Window Length',
};

export const relationTypeStrategy: SelectObject<string> = {
    dropdownId: 'relation-type-dropdown',
    options: [
        { value: 'one-to-one', label: 'One to One' },
        { value: 'one-to-many', label: 'One to Many' },
        { value: 'many-to-one', label: 'Many to One' },
        { value: 'many-to-many', label: 'Many to Many' },
    ],
    label: 'Select Relation Type',
};

export const objectDestinationStrategy: SelectObject<string> = {
    dropdownId: 'object-destination-dropdown',
    options: [
        { value: 'object1', label: 'Object 1' },
        { value: 'object2', label: 'Object 2' },
        { value: 'object3', label: 'Object 3' },
    ],
    label: 'Select Object Destination',
};






export const StrategyType = {
    ANALYTICS_GRAPH_WINDOW_LENGTH: analyticsGraphWindowLengthStrategy,
    RELATION_TYPE: relationTypeStrategy,
    OBJECT_DESTINATION: objectDestinationStrategy
} as const;