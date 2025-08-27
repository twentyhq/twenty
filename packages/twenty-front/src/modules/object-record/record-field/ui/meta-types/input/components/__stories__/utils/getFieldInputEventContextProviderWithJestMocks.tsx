import { FieldInputEventContext } from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { fn } from '@storybook/test';
import { type PropsWithChildren } from 'react';

type FieldInputEventContextProviderWithJestMocksProps = PropsWithChildren;

export const getFieldInputEventContextProviderWithJestMocks = () => {
  const handleSubmitMocked = fn();
  const handleCancelMocked = fn();
  const handleClickoutsideMocked = fn();
  const handleEnterMocked = fn();
  const handleEscapeMocked = fn();
  const handleShiftTabMocked = fn();
  const handleTabMocked = fn();

  const FieldInputEventContextProviderWithJestMocks = ({
    children,
  }: FieldInputEventContextProviderWithJestMocksProps) => {
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
    FieldInputEventContextProviderWithJestMocks,
    handleSubmitMocked,
    handleCancelMocked,
    handleClickoutsideMocked,
    handleEnterMocked,
    handleEscapeMocked,
    handleShiftTabMocked,
    handleTabMocked,
  };
};
