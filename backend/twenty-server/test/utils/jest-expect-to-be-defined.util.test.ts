type AssertIsDefined = <T>(value: T) => asserts value is NonNullable<T>;

export const jestExpectToBeDefined: AssertIsDefined = (value) => {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();
};
