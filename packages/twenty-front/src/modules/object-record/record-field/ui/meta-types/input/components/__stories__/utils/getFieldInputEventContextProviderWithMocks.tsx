import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { type PropsWithChildren } from 'react';
import { fn } from 'storybook/test';

type FieldInputEventContextProviderWithMocksProps = PropsWithChildren;

export const getFieldInputEventContextProviderWithMocks = () => {
  const handleSubmitMocked = fn();
  const handleCancelMocked = fn();
  const handleClickoutsideMocked = fn();
  const handleEnterMocked = fn();
  const handleEscapeMocked = fn();
  const handleShiftTabMocked = fn();
  const handleTabMocked = fn();

  const FieldInputEventContextProviderWithMocks = ({
    children,
  }: FieldInputEventContextProviderWithMocksProps) => {
    return (
      <FieldInputEventContext.Provider
        value={{
          onCancel: handleCancelMocked,
          onClickOutside: handleClickoutsideMocked,
          onSubmit: handleSubmitMocked,
          onEnter: handleEnterMocked,
          onEscape: handleEscapeMocked,
          onShiftTab: handleShiftTabMocked,
          onTab: handleTabMocked,
        }}
      >
        {children}
      </FieldInputEventContext.Provider>
    );
  };

  return {
    FieldInputEventContextProviderWithMocks,
    handleSubmitMocked,
    handleCancelMocked,
    handleClickoutsideMocked,
    handleEnterMocked,
    handleEscapeMocked,
    handleShiftTabMocked,
    handleTabMocked,
  };
};
