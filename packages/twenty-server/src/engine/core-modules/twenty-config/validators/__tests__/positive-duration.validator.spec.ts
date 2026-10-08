import { type ValidationArguments } from 'class-validator';

import { PositiveDurationConstraint } from 'src/engine/core-modules/twenty-config/validators/positive-duration.validator';

describe('PositiveDurationConstraint', () => {
  const constraint = new PositiveDurationConstraint();

  const validate = (duration: unknown, isZeroAllowed: boolean) =>
    constraint.validate(duration, {
      constraints: [isZeroAllowed],
    } as ValidationArguments);

  describe.each([
    ['zero disallowed', false],
    ['zero allowed', true],
  ])('%s', (_label, isZeroAllowed) => {
    it.each(['30d', '12h', '10m', '1s', '0.5ms'])(
      'should accept the positive duration %s',
      (duration) => {
        expect(validate(duration, isZeroAllowed)).toBe(true);
      },
    );

    it.each(['-1s', '-10m'])(
      'should reject the negative duration %s',
      (duration) => {
        expect(validate(duration, isZeroAllowed)).toBe(false);
      },
    );

    it.each(['1Month', 'not-a-duration', '', undefined, null, 42])(
      'should reject %s, which ms cannot parse',
      (duration) => {
        expect(validate(duration, isZeroAllowed)).toBe(false);
      },
    );
  });

  it('should reject zero when zero is not allowed', () => {
    expect(validate('0s', false)).toBe(false);
  });

  it('should accept zero when zero is allowed', () => {
    expect(validate('0s', true)).toBe(true);
  });
});
