import { type STOCK_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';

export type StockMeter = (typeof STOCK_METERS)[number];
