# SPEC — TwentyCRM_SM

## Cel
CRM jako centralny hub sprzedaży + integracje (ACX, partnerzy, RODO, uprawnienia).

## Lead flow (statusy)
- `otrzymany` — nowy lead w systemie
- `przydzielony` — przypisany do handlowca
- `brak_kontaktu_dialer` — dialer nie dodzwonił się
- `brak_kontaktu` — handlowiec nie dodzwonił się
- `ponowic_kontakt` — zaplanowany ponowny kontakt
- `oferta_wyslana` — oferta wysłana do klienta
- `decyzja_klienta` — oczekiwanie na decyzję
- `sprzedaz` — sprzedaż zrealizowana
- `niezainteresowany` — klient odmówił
- `zamkniety_brak_kontaktu` — zamknięty z powodu braku kontaktu
- `dubel` — zduplikowany lead
- `zanonimizowany` — dane usunięte (RODO)

## Deduplikacja
Telefon jest unikalny. Lead zawsze dowiązany do kontaktu po telefonie.
