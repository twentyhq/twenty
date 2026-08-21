# fix(date-picker): display month and year labels when date is unpopulated (#24336)

## Summary
Resolves #24336 by passing `monthDate` from `react-datepicker` to `DatePickerHeader` and falling back to `monthDate` or current date in `dateParsed` and month navigation handlers, ensuring that month and year labels and dropdowns display properly when opening the date picker on unpopulated date fields.

Closes #24336
